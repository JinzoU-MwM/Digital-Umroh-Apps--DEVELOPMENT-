import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface RoomAssignmentDto {
  pilgrim_id: string;
  room_number: string;
  building: string;
  floor: number;
  bed_number?: number;
  assigned_by: string;
  notes?: string;
}

export interface RoomPreferenceDto {
  pilgrim_id: string;
  preferred_roommates: string[];
  preferred_building?: string;
  preferred_floor?: number;
  special_requests?: string;
}

export interface Room {
  id: string;
  number: string;
  building: string;
  floor: number;
  capacity: number;
  current_occupancy: number;
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  type: 'QUAD' | 'TRIPLE' | 'DOUBLE' | 'SINGLE';
  amenities: string[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  pilgrims: Array<{
    pilgrim_id: string;
    name: string;
    bed_number: number;
    assigned_at: Date;
  }>;
}

export interface RoomingReport {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  total_pilgrims: number;
  assigned_pilgrims: number;
  unassigned_pilgrims: number;
  occupancy_rate: number;
  rooms_by_building: Record<string, {
    total: number;
    occupied: number;
    available: number;
  }>;
  rooms_by_type: Record<string, {
    total: number;
    occupied: number;
    available: number;
  }>;
}

@Injectable()
export class RoomingService {
  private readonly logger = new Logger(RoomingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async assignRoom(assignmentDto: RoomAssignmentDto, tenantId: string) {
    const { pilgrim_id, room_number, building, floor, bed_number, assigned_by, notes } = assignmentDto;

    // Validate pilgrim exists and belongs to tenant
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id: pilgrim_id,
        deleted_at: null,
      },
      include: {
        booking: {
          include: {
            package: true,
          },
        },
        customer: true,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    // Check if pilgrim is already assigned to a room
    if (pilgrim.room_number) {
      throw new BadRequestException('Pilgrim is already assigned to a room');
    }

    // Check if room exists and has capacity
    const roomCapacity = this.getRoomCapacity(room_number, building);
    const currentOccupancy = await this.getCurrentOccupancy(room_number, building, floor);

    if (currentOccupancy >= roomCapacity) {
      throw new ConflictException('Room is at full capacity');
    }

    // Check gender compatibility
    const roomGender = await this.getRoomGender(room_number, building, floor);
    if (roomGender && roomGender !== pilgrim.gender && roomGender !== 'MIXED') {
      throw new BadRequestException(`Room is assigned to ${roomGender} pilgrims`);
    }

    // Assign room to pilgrim
    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: pilgrim_id },
      data: {
        room_number,
        building,
        floor,
        // Note: bed_number would need to be added to schema if needed
        notes: notes ? `${pilgrim.notes || ''}\nRoom assignment: ${notes}`.trim() : pilgrim.notes,
      },
    });

    // Send notification to pilgrim
    await this.notificationsService.sendNotification({
      tenant_id: tenantId,
      recipient_id: null, // Will be sent to pilgrim
      type: 'ROOM_ASSIGNMENT',
      channel: 'WHATSAPP',
      title: 'Room Assignment',
      content: `You have been assigned to room ${room_number}, ${building} building, floor ${floor}`,
      template_data: {
        pilgrim_name: pilgrim.name,
        room_number,
        building,
        floor: floor.toString(),
        package_name: pilgrim.booking?.package?.name,
        departure_date: pilgrim.booking?.departure_date?.toISOString().split('T')[0],
      },
    });

    this.logger.log(`Room assigned successfully: ${room_number} to pilgrim ${pilgrim_id}`);

    return {
      success: true,
      pilgrim: updatedPilgrim,
      room: {
        number: room_number,
        building,
        floor,
        capacity: roomCapacity,
        current_occupancy: currentOccupancy + 1,
      },
    };
  }

  async reassignRoom(
    pilgrim_id: string,
    newAssignment: Partial<RoomAssignmentDto>,
    tenantId: string,
    reassignedBy: string,
  ) {
    // Get current pilgrim details
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id: pilgrim_id,
        deleted_at: null,
      },
      include: {
        booking: true,
        customer: true,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    const oldRoom = {
      number: pilgrim.room_number,
      building: pilgrim.building,
      floor: pilgrim.floor,
    };

    // Update room assignment
    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: pilgrim_id },
      data: {
        room_number: newAssignment.room_number,
        building: newAssignment.building,
        floor: newAssignment.floor,
        notes: newAssignment.notes
          ? `${pilgrim.notes || ''}\nRoom reassignment: ${newAssignment.notes}`.trim()
          : pilgrim.notes,
      },
    });

    // Send notification about room change
    await this.notificationsService.sendNotification({
      tenant_id: tenantId,
      recipient_id: null,
      type: 'ROOM_ASSIGNMENT',
      channel: 'WHATSAPP',
      title: 'Room Assignment Updated',
      content: `Your room has been changed from ${oldRoom.number} (${oldRoom.building}) to ${newAssignment.room_number} (${newAssignment.building})`,
      template_data: {
        pilgrim_name: pilgrim.name,
        old_room: `${oldRoom.number} - ${oldRoom.building}`,
        new_room: `${newAssignment.room_number} - ${newAssignment.building}`,
        reason: newAssignment.notes || 'Administrative update',
      },
    });

    this.logger.log(`Room reassigned for pilgrim ${pilgrim_id}: ${oldRoom.number} -> ${newAssignment.room_number}`);

    return {
      success: true,
      pilgrim: updatedPilgrim,
      old_room: oldRoom,
      new_room: {
        number: newAssignment.room_number,
        building: newAssignment.building,
        floor: newAssignment.floor,
      },
    };
  }

  async removeFromRoom(pilgrim_id: string, tenantId: string, removedBy: string, reason?: string) {
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id: pilgrim_id,
        deleted_at: null,
      },
      include: {
        customer: true,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    if (!pilgrim.room_number) {
      throw new BadRequestException('Pilgrim is not assigned to any room');
    }

    const oldRoom = {
      number: pilgrim.room_number,
      building: pilgrim.building,
      floor: pilgrim.floor,
    };

    // Remove room assignment
    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: pilgrim_id },
      data: {
        room_number: null,
        building: null,
        floor: null,
        notes: reason
          ? `${pilgrim.notes || ''}\nRoom removal: ${reason}`.trim()
          : pilgrim.notes,
      },
    });

    // Send notification
    await this.notificationsService.sendNotification({
      tenant_id: tenantId,
      recipient_id: null,
      type: 'ROOM_ASSIGNMENT',
      channel: 'WHATSAPP',
      title: 'Room Assignment Removed',
      content: `Your room assignment has been removed${reason ? `. Reason: ${reason}` : ''}`,
      template_data: {
        pilgrim_name: pilgrim.name,
        old_room: `${oldRoom.number} - ${oldRoom.building}`,
        reason: reason || 'Administrative update',
      },
    });

    this.logger.log(`Pilgrim ${pilgrim_id} removed from room ${oldRoom.number}`);

    return {
      success: true,
      pilgrim: updatedPilgrim,
      removed_from: oldRoom,
    };
  }

  async getRoomOccupancy(building?: string, floor?: number, tenantId: string) {
    const where: any = {
      deleted_at: null,
    };

    if (building) {
      where.building = building;
    }

    if (floor) {
      where.floor = floor;
    }

    const pilgrims = await this.prisma.pilgrim.findMany({
      where,
      select: {
        id: true,
        name: true,
        gender: true,
        room_number: true,
        building: true,
        floor: true,
        booking: {
          select: {
            package: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by rooms
    const roomsMap = new Map<string, Room>();

    pilgrims.forEach((pilgrim) => {
      if (pilgrim.room_number && pilgrim.building && pilgrim.floor) {
        const roomKey = `${pilgrim.building}-${pilgrim.floor}-${pilgrim.room_number}`;

        if (!roomsMap.has(roomKey)) {
          const capacity = this.getRoomCapacity(pilgrim.room_number, pilgrim.building);
          roomsMap.set(roomKey, {
            id: roomKey,
            number: pilgrim.room_number,
            building: pilgrim.building,
            floor: pilgrim.floor,
            capacity,
            current_occupancy: 0,
            gender: pilgrim.gender as 'MALE' | 'FEMALE',
            type: this.getRoomType(capacity),
            amenities: this.getRoomAmenities(pilgrim.building, pilgrim.room_number),
            status: 'OCCUPIED',
            pilgrims: [],
          });
        }

        const room = roomsMap.get(roomKey)!;
        room.current_occupancy++;
        room.pilgrims.push({
          pilgrim_id: pilgrim.id,
          name: pilgrim.name,
          bed_number: room.current_occupancy, // Simplified bed assignment
          assigned_at: pilgrim.updated_at,
        });
      }
    });

    const rooms = Array.from(roomsMap.values());

    return {
      rooms,
      summary: {
        total_rooms: rooms.length,
        occupied_rooms: rooms.filter(r => r.current_occupancy > 0).length,
        total_pilgrims_assigned: pilgrims.filter(p => p.room_number).length,
      },
    };
  }

  async getRoomingReport(tenantId: string): Promise<RoomingReport> {
    const pilgrims = await this.prisma.pilgrim.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        gender: true,
        room_number: true,
        building: true,
        floor: true,
      },
    });

    const assignedPilgrims = pilgrims.filter(p => p.room_number);
    const unassignedPilgrims = pilgrims.filter(p => !p.room_number);

    // Calculate room statistics
    const roomsMap = new Map<string, Room>();
    const buildingsMap = new Map<string, number>();
    const typesMap = new Map<string, { total: number; occupied: number }>();

    assignedPilgrims.forEach((pilgrim) => {
      const roomKey = `${pilgrim.building}-${pilgrim.floor}-${pilgrim.room_number}`;

      if (!roomsMap.has(roomKey)) {
        const capacity = this.getRoomCapacity(pilgrim.room_number, pilgrim.building);
        const type = this.getRoomType(capacity);

        roomsMap.set(roomKey, {
          id: roomKey,
          number: pilgrim.room_number,
          building: pilgrim.building,
          floor: pilgrim.floor,
          capacity,
          current_occupancy: 0,
          gender: pilgrim.gender as 'MALE' | 'FEMALE',
          type,
          amenities: [],
          status: 'OCCUPIED',
          pilgrims: [],
        });

        // Track by building
        buildingsMap.set(pilgrim.building, (buildingsMap.get(pilgrim.building) || 0) + 1);

        // Track by type
        if (!typesMap.has(type)) {
          typesMap.set(type, { total: 0, occupied: 0 });
        }
        typesMap.get(type)!.total++;
      }

      const room = roomsMap.get(roomKey)!;
      room.current_occupancy++;
    });

    const rooms = Array.from(roomsMap.values());
    const occupiedRooms = rooms.filter(r => r.current_occupancy > 0);

    // Build report
    const roomsByBuilding: Record<string, { total: number; occupied: number; available: number }> = {};
    buildingsMap.forEach((total, building) => {
      const occupied = rooms.filter(r => r.building === building && r.current_occupancy > 0).length;
      roomsByBuilding[building] = {
        total,
        occupied,
        available: total - occupied,
      };
    });

    const roomsByType: Record<string, { total: number; occupied: number; available: number }> = {};
    typesMap.forEach((stats, type) => {
      const occupied = rooms.filter(r => r.type === type && r.current_occupancy > 0).length;
      roomsByType[type] = {
        total: stats.total,
        occupied,
        available: stats.total - occupied,
      };
    });

    return {
      total_rooms: rooms.length,
      occupied_rooms: occupiedRooms.length,
      available_rooms: rooms.length - occupiedRooms.length,
      total_pilgrims: pilgrims.length,
      assigned_pilgrims: assignedPilgrims.length,
      unassigned_pilgrims: unassignedPilgrims.length,
      occupancy_rate: rooms.length > 0 ? Math.round((occupiedRooms.length / rooms.length) * 100) : 0,
      rooms_by_building: roomsByBuilding,
      rooms_by_type: roomsByType,
    };
  }

  async generateRoomingList(booking_id: string, tenantId: string) {
    // Get all pilgrims for this booking
    const pilgrims = await this.prisma.pilgrim.findMany({
      where: {
        booking_id,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        gender: true,
        birth_date: true,
        room_number: true,
        building: true,
        floor: true,
        phone: true,
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { building: 'asc' },
        { floor: 'asc' },
        { room_number: 'asc' },
        { name: 'asc' },
      ],
    });

    const assignedPilgrims = pilgrims.filter(p => p.room_number);
    const unassignedPilgrims = pilgrims.filter(p => !p.room_number);

    // Group assigned pilgrims by room
    const roomsMap = new Map<string, any[]>();

    assignedPilgrims.forEach((pilgrim) => {
      const roomKey = `${pilgrim.building} - Floor ${pilgrim.floor} - Room ${pilgrim.room_number}`;

      if (!roomsMap.has(roomKey)) {
        roomsMap.set(roomKey, []);
      }

      roomsMap.get(roomKey)!.push(pilgrim);
    });

    return {
      booking_id,
      generated_at: new Date(),
      summary: {
        total_pilgrims: pilgrims.length,
        assigned_pilgrims: assignedPilgrims.length,
        unassigned_pilgrims: unassignedPilgrims.length,
        total_rooms: roomsMap.size,
        assignment_rate: Math.round((assignedPilgrims.length / pilgrims.length) * 100),
      },
      rooms: Array.from(roomsMap.entries()).map(([room, pilgrims]) => ({
        room,
        pilgrims,
        capacity: this.getRoomCapacity(pilgrims[0].room_number, pilgrims[0].building),
        occupancy: pilgrims.length,
      })),
      unassigned_pilgrims,
    };
  }

  private getRoomCapacity(roomNumber: string, building: string): number {
    // This logic would depend on your room numbering system
    // For example, rooms starting with '1' might be single, '2' double, etc.
    const prefix = roomNumber.charAt(0);

    switch (prefix) {
      case '1': return 1; // Single
      case '2': return 2; // Double
      case '3': return 3; // Triple
      case '4': return 4; // Quad
      default: return 4; // Default to quad
    }
  }

  private getRoomType(capacity: number): 'QUAD' | 'TRIPLE' | 'DOUBLE' | 'SINGLE' {
    switch (capacity) {
      case 1: return 'SINGLE';
      case 2: return 'DOUBLE';
      case 3: return 'TRIPLE';
      case 4: return 'QUAD';
      default: return 'QUAD';
    }
  }

  private async getCurrentOccupancy(roomNumber: string, building: string, floor: number): Promise<number> {
    return await this.prisma.pilgrim.count({
      where: {
        room_number,
        building,
        floor,
        deleted_at: null,
      },
    });
  }

  private async getRoomGender(roomNumber: string, building: string, floor: number): Promise<'MALE' | 'FEMALE' | 'MIXED' | null> {
    const pilgrims = await this.prisma.pilgrim.findMany({
      where: {
        room_number,
        building,
        floor,
        deleted_at: null,
      },
      select: { gender: true },
      take: 1,
    });

    if (pilgrims.length === 0) {
      return null;
    }

    return pilgrims[0].gender as 'MALE' | 'FEMALE';
  }

  private getRoomAmenities(building: string, roomNumber: string): string[] {
    // This would be based on your building/room configuration
    // For now, returning default amenities
    return [
      'Air Conditioning',
      'Private Bathroom',
      'WiFi',
      'Safe Deposit Box',
      'Prayer Mat',
      'Quran',
    ];
  }
}