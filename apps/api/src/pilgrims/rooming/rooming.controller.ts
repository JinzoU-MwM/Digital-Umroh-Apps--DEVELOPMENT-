import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoomingService, RoomAssignmentDto } from './rooming.service';
import { TenantId } from '../decorators/tenant-id.decorator';

@ApiTags('rooming')
@Controller('rooming')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomingController {
  private readonly logger = new Logger(RoomingController.name);

  constructor(private readonly roomingService: RoomingService) {}

  @Post('assign')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Assign pilgrim to a room' })
  @ApiResponse({ status: 201, description: 'Room assigned successfully' })
  async assignRoom(
    @Body() assignmentDto: RoomAssignmentDto,
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      const result = await this.roomingService.assignRoom({
        ...assignmentDto,
        assigned_by: req.user.id,
      }, tenantId);

      return {
        success: true,
        message: 'Room assigned successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to assign room: ${error.message}`);
      throw error;
    }
  }

  @Put('reassign/:pilgrimId')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Reassign pilgrim to a different room' })
  @ApiResponse({ status: 200, description: 'Room reassigned successfully' })
  async reassignRoom(
    @Param('pilgrimId') pilgrimId: string,
    @Body() newAssignment: Partial<RoomAssignmentDto>,
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      const result = await this.roomingService.reassignRoom(
        pilgrimId,
        newAssignment,
        tenantId,
        req.user.id,
      );

      return {
        success: true,
        message: 'Room reassigned successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to reassign room: ${error.message}`);
      throw error;
    }
  }

  @Delete('remove/:pilgrimId')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Remove pilgrim from room assignment' })
  @ApiResponse({ status: 200, description: 'Room assignment removed successfully' })
  async removeFromRoom(
    @Param('pilgrimId') pilgrimId: string,
    @Body() body: { reason?: string },
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      const result = await this.roomingService.removeFromRoom(
        pilgrimId,
        tenantId,
        req.user.id,
        body.reason,
      );

      return {
        success: true,
        message: 'Room assignment removed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to remove room assignment: ${error.message}`);
      throw error;
    }
  }

  @Get('occupancy')
  @Roles('OWNER', 'ADMIN', 'OPERATION', 'SALES', 'VIEWER')
  @ApiOperation({ summary: 'Get room occupancy information' })
  @ApiResponse({ status: 200, description: 'Room occupancy retrieved successfully' })
  async getRoomOccupancy(
    @Query('building') building?: string,
    @Query('floor') floor?: string,
    @TenantId() tenantId: string,
  ) {
    try {
      const floorNumber = floor ? parseInt(floor) : undefined;
      const result = await this.roomingService.getRoomOccupancy(building, floorNumber, tenantId);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to get room occupancy: ${error.message}`);
      throw error;
    }
  }

  @Get('report')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Get comprehensive rooming report' })
  @ApiResponse({ status: 200, description: 'Rooming report generated successfully' })
  async getRoomingReport(@TenantId() tenantId: string) {
    try {
      const report = await this.roomingService.getRoomingReport(tenantId);

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`Failed to generate rooming report: ${error.message}`);
      throw error;
    }
  }

  @Get('rooming-list/:bookingId')
  @Roles('OWNER', 'ADMIN', 'OPERATION', 'SALES')
  @ApiOperation({ summary: 'Generate rooming list for a booking' })
  @ApiResponse({ status: 200, description: 'Rooming list generated successfully' })
  async generateRoomingList(
    @Param('bookingId') bookingId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      const roomingList = await this.roomingService.generateRoomingList(bookingId, tenantId);

      return {
        success: true,
        data: roomingList,
      };
    } catch (error) {
      this.logger.error(`Failed to generate rooming list: ${error.message}`);
      throw error;
    }
  }

  @Get('unassigned')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Get list of unassigned pilgrims' })
  @ApiResponse({ status: 200, description: 'Unassigned pilgrims retrieved successfully' })
  async getUnassignedPilgrims(
    @Query('booking_id') bookingId?: string,
    @Query('limit') limit?: string,
    @TenantId() tenantId: string,
  ) {
    try {
      // This would need to be implemented in the service
      // For now, returning a placeholder response
      return {
        success: true,
        data: {
          unassigned_pilgrims: [],
          total: 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get unassigned pilgrims: ${error.message}`);
      throw error;
    }
  }

  @Get('room-details/:roomNumber/:building/:floor')
  @Roles('OWNER', 'ADMIN', 'OPERATION', 'SALES', 'VIEWER')
  @ApiOperation({ summary: 'Get detailed information about a specific room' })
  @ApiResponse({ status: 200, description: 'Room details retrieved successfully' })
  async getRoomDetails(
    @Param('roomNumber') roomNumber: string,
    @Param('building') building: string,
    @Param('floor') floor: string,
    @TenantId() tenantId: string,
  ) {
    try {
      const floorNumber = parseInt(floor);
      const occupancy = await this.roomingService.getRoomOccupancy(building, floorNumber, tenantId);

      const room = occupancy.rooms.find(r =>
        r.number === roomNumber &&
        r.building === building &&
        r.floor === floorNumber
      );

      if (!room) {
        return {
          success: true,
          data: {
            room: {
              number: roomNumber,
              building,
              floor: floorNumber,
              capacity: this.roomingService.getRoomCapacity(roomNumber, building),
              current_occupancy: 0,
              status: 'AVAILABLE',
              pilgrims: [],
            },
          },
        };
      }

      return {
        success: true,
        data: { room },
      };
    } catch (error) {
      this.logger.error(`Failed to get room details: ${error.message}`);
      throw error;
    }
  }

  @Post('bulk-assign')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Bulk assign multiple pilgrims to rooms' })
  @ApiResponse({ status: 201, description: 'Bulk room assignment completed' })
  async bulkAssignRooms(
    @Body() body: {
      assignments: Array<{
        pilgrim_id: string;
        room_number: string;
        building: string;
        floor: number;
        notes?: string;
      }>;
    },
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      const results = {
        successful: [],
        failed: [],
      };

      for (const assignment of body.assignments) {
        try {
          await this.roomingService.assignRoom({
            ...assignment,
            assigned_by: req.user.id,
          }, tenantId);

          results.successful.push({
            pilgrim_id: assignment.pilgrim_id,
            room: `${assignment.building} - ${assignment.room_number}`,
          });
        } catch (error) {
          results.failed.push({
            pilgrim_id: assignment.pilgrim_id,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        message: `Completed ${results.successful.length} assignments, ${results.failed.length} failed`,
        data: results,
      };
    } catch (error) {
      this.logger.error(`Failed to bulk assign rooms: ${error.message}`);
      throw error;
    }
  }
}