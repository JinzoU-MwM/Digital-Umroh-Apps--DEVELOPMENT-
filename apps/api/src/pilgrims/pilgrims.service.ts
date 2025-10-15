import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePilgrimDto, UpdatePilgrimDto, PilgrimQueryDto } from './dto/pilgrim.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PilgrimsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPilgrimDto: CreatePilgrimDto, tenantId: string) {
    const { id_number, passport_number, phone, email, booking_id } = createPilgrimDto;

    // Validate booking exists and belongs to tenant
    if (booking_id) {
      const booking = await this.prisma.booking.findFirst({
        where: {
          id: booking_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
    }

    // Check for duplicate ID number
    const existingPilgrimById = await this.prisma.pilgrim.findFirst({
      where: {
        tenant_id: tenantId,
        id_number,
        deleted_at: null,
      },
    });

    if (existingPilgrimById) {
      throw new ConflictException('Pilgrim with this ID number already exists');
    }

    // Check for duplicate passport number if provided
    if (passport_number) {
      const existingPilgrimByPassport = await this.prisma.pilgrim.findFirst({
        where: {
          tenant_id: tenantId,
          passport_number,
          deleted_at: null,
        },
      });

      if (existingPilgrimByPassport) {
        throw new ConflictException('Pilgrim with this passport number already exists');
      }
    }

    // Check for duplicate phone if provided
    if (phone) {
      const existingPilgrimByPhone = await this.prisma.pilgrim.findFirst({
        where: {
          tenant_id: tenantId,
          phone,
          deleted_at: null,
        },
      });

      if (existingPilgrimByPhone) {
        throw new ConflictException('Pilgrim with this phone number already exists');
      }
    }

    // Check for duplicate email if provided
    if (email) {
      const existingPilgrimByEmail = await this.prisma.pilgrim.findFirst({
        where: {
          tenant_id: tenantId,
          email,
          deleted_at: null,
        },
      });

      if (existingPilgrimByEmail) {
        throw new ConflictException('Pilgrim with this email already exists');
      }
    }

    // Create pilgrim
    const pilgrim = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.pilgrim.create({
        data: {
          tenant_id: tenantId,
          name: createPilgrimDto.name,
          nationality: createPilgrimDto.nationality,
          place_of_birth: createPilgrimDto.place_of_birth,
          birth_date: new Date(createPilgrimDto.birth_date),
          gender: createPilgrimDto.gender,
          marital_status: createPilgrimDto.marital_status,
          occupation: createPilgrimDto.occupation,
          address: createPilgrimDto.address,
          phone: createPilgrimDto.phone,
          email: createPilgrimDto.email,
          id_type: createPilgrimDto.id_type,
          id_number: createPilgrimDto.id_number,
          passport_number: createPilgrimDto.passport_number,
          passport_issue_date: createPilgrimDto.passport_issue_date
            ? new Date(createPilgrimDto.passport_issue_date)
            : null,
          passport_expiry_date: createPilgrimDto.passport_expiry_date
            ? new Date(createPilgrimDto.passport_expiry_date)
            : null,
          passport_issuing_authority: createPilgrimDto.passport_issuing_authority,
          family_relationships: createPilgrimDto.family_relationships
            ? JSON.parse(JSON.stringify(createPilgrimDto.family_relationships))
            : [],
          emergency_contact_name: createPilgrimDto.emergency_contact_name,
          emergency_contact_phone: createPilgrimDto.emergency_contact_phone,
          emergency_contact_relationship: createPilgrimDto.emergency_contact_relationship,
          health_conditions: createPilgrimDto.health_conditions,
          food_preferences: createPilgrimDto.food_preferences,
          notes: createPilgrimDto.notes,
          booking_id: createPilgrimDto.booking_id,
        },
      });
    });

    return pilgrim;
  }

  async findAll(query: PilgrimQueryDto, tenantId: string, currentUser: any) {
    const {
      page = 1,
      limit = 20,
      search,
      gender,
      nationality,
      marital_status,
      booking_id,
      customer_id,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { id_number: { contains: search, mode: 'insensitive' } },
        { passport_number: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (gender) {
      where.gender = gender;
    }

    if (nationality) {
      where.nationality = nationality;
    }

    if (marital_status) {
      where.marital_status = marital_status;
    }

    if (booking_id) {
      where.booking_id = booking_id;
    }

    if (customer_id) {
      // Join with booking to filter by customer
      where.booking = {
        customer_id: customer_id,
      };
    }

    // Get total count
    const total = await this.prisma.pilgrim.count({ where });

    // Get pilgrims with pagination
    const pilgrims = await this.prisma.pilgrim.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        booking: {
          select: {
            id: true,
            booking_code: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      pilgrims,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async search(query: string, limit: number, tenantId: string) {
    return this.prisma.pilgrim.findMany({
      where: {
        deleted_at: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { id_number: { contains: query, mode: 'insensitive' } },
          { passport_number: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        id_number: true,
        passport_number: true,
        phone: true,
        booking_id: true,
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        booking: {
          select: {
            id: true,
            booking_code: true,
            package: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    return pilgrim;
  }

  async update(id: string, updatePilgrimDto: UpdatePilgrimDto, tenantId: string, currentUser: any) {
    // Check if pilgrim exists
    const existingPilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!existingPilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    // Check for conflicts if updating unique fields
    const { id_number, passport_number, phone, email } = updatePilgrimDto;

    if (id_number && id_number !== existingPilgrim.id_number) {
      const conflict = await this.prisma.pilgrim.findFirst({
        where: {
          tenant_id: tenantId,
          id_number,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new ConflictException('Pilgrim with this ID number already exists');
      }
    }

    if (passport_number && passport_number !== existingPilgrim.passport_number) {
      const conflict = await this.prisma.pilgrim.findFirst({
        where: {
          tenant_id: tenantId,
          passport_number,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new ConflictException('Pilgrim with this passport number already exists');
      }
    }

    if (phone && phone !== existingPilgrim.phone) {
      const conflict = await this.prisma.pilgrim.findFirst({
        where: {
          tenant_id: tenantId,
          phone,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new ConflictException('Pilgrim with this phone number already exists');
      }
    }

    if (email && email !== existingPilgrim.email) {
      const conflict = await this.prisma.pilgrim.findFirst({
        where: {
          tenant_id: tenantId,
          email,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new ConflictException('Pilgrim with this email already exists');
      }
    }

    // Update pilgrim
    const pilgrim = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.pilgrim.update({
        where: { id },
        data: {
          name: updatePilgrimDto.name,
          nationality: updatePilgrimDto.nationality,
          place_of_birth: updatePilgrimDto.place_of_birth,
          birth_date: updatePilgrimDto.birth_date
            ? new Date(updatePilgrimDto.birth_date)
            : undefined,
          gender: updatePilgrimDto.gender,
          marital_status: updatePilgrimDto.marital_status,
          occupation: updatePilgrimDto.occupation,
          address: updatePilgrimDto.address,
          phone: updatePilgrimDto.phone,
          email: updatePilgrimDto.email,
          id_type: updatePilgrimDto.id_type,
          id_number: updatePilgrimDto.id_number,
          passport_number: updatePilgrimDto.passport_number,
          passport_issue_date: updatePilgrimDto.passport_issue_date
            ? new Date(updatePilgrimDto.passport_issue_date)
            : undefined,
          passport_expiry_date: updatePilgrimDto.passport_expiry_date
            ? new Date(updatePilgrimDto.passport_expiry_date)
            : undefined,
          passport_issuing_authority: updatePilgrimDto.passport_issuing_authority,
          family_relationships: updatePilgrimDto.family_relationships
            ? JSON.parse(JSON.stringify(updatePilgrimDto.family_relationships))
            : undefined,
          emergency_contact_name: updatePilgrimDto.emergency_contact_name,
          emergency_contact_phone: updatePilgrimDto.emergency_contact_phone,
          emergency_contact_relationship: updatePilgrimDto.emergency_contact_relationship,
          health_conditions: updatePilgrimDto.health_conditions,
          food_preferences: updatePilgrimDto.food_preferences,
          notes: updatePilgrimDto.notes,
        },
      });
    });

    return pilgrim;
  }

  async remove(id: string, tenantId: string) {
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    // Soft delete
    await this.prisma.pilgrim.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async getStats(tenantId: string) {
    const [
      totalPilgrims,
      pilgrimsByGender,
      pilgrimsByNationality,
      pilgrimsByMaritalStatus,
      recentPilgrims,
    ] = await Promise.all([
      this.prisma.pilgrim.count({
        where: { deleted_at: null },
      }),
      this.prisma.pilgrim.groupBy({
        by: ['gender'],
        where: { deleted_at: null },
        _count: { gender: true },
      }),
      this.prisma.pilgrim.groupBy({
        by: ['nationality'],
        where: { deleted_at: null },
        _count: { nationality: true },
        orderBy: { _count: { nationality: 'desc' } },
        take: 10,
      }),
      this.prisma.pilgrim.groupBy({
        by: ['marital_status'],
        where: { deleted_at: null },
        _count: { marital_status: true },
      }),
      this.prisma.pilgrim.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
          deleted_at: null,
        },
      }),
    ]);

    return {
      total: totalPilgrims,
      byGender: pilgrimsByGender.map(item => ({
        gender: item.gender,
        count: item._count.gender,
      })),
      byNationality: pilgrimsByNationality.map(item => ({
        nationality: item.nationality,
        count: item._count.nationality,
      })),
      byMaritalStatus: pilgrimsByMaritalStatus.map(item => ({
        marital_status: item.marital_status,
        count: item._count.marital_status,
      })),
      recentCount: recentPilgrims,
    };
  }

  async exportToExcel(query: PilgrimQueryDto, tenantId: string) {
    const { pilgrims } = await this.findAll(
      { ...query, limit: 10000 }, // Large limit for export
      tenantId,
      null,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pilgrims');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'ID Number', key: 'id_number', width: 20 },
      { header: 'Passport Number', key: 'passport_number', width: 20 },
      { header: 'Nationality', key: 'nationality', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Birth Date', key: 'birth_date', width: 15 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Booking Code', key: 'booking_code', width: 15 },
      { header: 'Customer', key: 'customer_name', width: 30 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];

    // Add data
    pilgrims.forEach((pilgrim) => {
      worksheet.addRow({
        name: pilgrim.name,
        id_number: pilgrim.id_number,
        passport_number: pilgrim.passport_number || '',
        nationality: pilgrim.nationality,
        gender: pilgrim.gender,
        birth_date: pilgrim.birth_date?.toISOString().split('T')[0] || '',
        phone: pilgrim.phone,
        email: pilgrim.email || '',
        booking_code: pilgrim.booking?.booking_code || '',
        customer_name: pilgrim.booking?.customer?.name || '',
        created_at: pilgrim.created_at.toISOString().split('T')[0],
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async bulkCreate(pilgrimsData: CreatePilgrimDto[], tenantId: string) {
    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const pilgrimData of pilgrimsData) {
      try {
        await this.create(pilgrimData, tenantId);
        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to create ${pilgrimData.name}: ${error.message}`);
      }
    }

    return results;
  }

  async assignToBooking(pilgrimId: string, bookingId: string, tenantId: string) {
    // Validate pilgrim exists
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id: pilgrimId,
        deleted_at: null,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    // Validate booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Update pilgrim with booking assignment
    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: pilgrimId },
      data: { booking_id: bookingId },
    });

    return updatedPilgrim;
  }

  async removeFromBooking(pilgrimId: string, tenantId: string) {
    // Validate pilgrim exists
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id: pilgrimId,
        deleted_at: null,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    // Remove booking assignment
    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: pilgrimId },
      data: { booking_id: null },
    });

    return updatedPilgrim;
  }
}