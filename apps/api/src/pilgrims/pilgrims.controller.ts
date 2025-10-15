import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Response,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PilgrimsService } from './pilgrims.service';
import { CreatePilgrimDto, UpdatePilgrimDto, PilgrimQueryDto } from './dto/pilgrim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('pilgrims')
@ApiBearerAuth()
@Controller('pilgrims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PilgrimsController {
  constructor(private readonly pilgrimsService: PilgrimsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new pilgrim' })
  @ApiResponse({ status: 201, description: 'Pilgrim created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Pilgrim already exists' })
  async create(@Body() createPilgrimDto: CreatePilgrimDto, @Request() req) {
    const pilgrim = await this.pilgrimsService.create(createPilgrimDto, req.user.tenantId);
    return {
      success: true,
      data: pilgrim,
      message: 'Pilgrim created successfully',
    };
  }

  @Post('bulk')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create multiple pilgrims in bulk' })
  @ApiResponse({ status: 201, description: 'Pilgrims created successfully' })
  async bulkCreate(@Body() pilgrimsData: CreatePilgrimDto[], @Request() req) {
    const results = await this.pilgrimsService.bulkCreate(pilgrimsData, req.user.tenantId);
    return {
      success: true,
      data: results,
      message: 'Bulk creation completed',
    };
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all pilgrims with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Pilgrims retrieved successfully' })
  async findAll(@Query() query: PilgrimQueryDto, @Request() req) {
    const result = await this.pilgrimsService.findAll(query, req.user.tenantId, req.user);
    return {
      success: true,
      data: result,
      message: 'Pilgrims retrieved successfully',
    };
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Search pilgrims by name, ID, or phone' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
    @Request() req,
  ) {
    const pilgrims = await this.pilgrimsService.search(query, limit, req.user.tenantId);
    return {
      success: true,
      data: pilgrims,
      message: 'Search results retrieved successfully',
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get pilgrims statistics overview' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req) {
    const stats = await this.pilgrimsService.getStats(req.user.tenantId);
    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }

  @Get('export/excel')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Export pilgrims to Excel file' })
  @ApiResponse({ status: 200, description: 'Excel file exported successfully' })
  async exportToExcel(
    @Query() query: PilgrimQueryDto,
    @Request() req,
    @Response() res,
  ) {
    const buffer = await this.pilgrimsService.exportToExcel(query, req.user.tenantId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pilgrims.xlsx');
    res.send(buffer);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get pilgrim by ID' })
  @ApiResponse({ status: 200, description: 'Pilgrim retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pilgrim not found' })
  @ApiParam({ name: 'id', description: 'Pilgrim ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const pilgrim = await this.pilgrimsService.findOne(id, req.user.tenantId);
    return {
      success: true,
      data: pilgrim,
      message: 'Pilgrim retrieved successfully',
    };
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update pilgrim by ID' })
  @ApiResponse({ status: 200, description: 'Pilgrim updated successfully' })
  @ApiResponse({ status: 404, description: 'Pilgrim not found' })
  @ApiResponse({ status: 409, description: 'Pilgrim data conflicts' })
  @ApiParam({ name: 'id', description: 'Pilgrim ID' })
  async update(
    @Param('id') id: string,
    @Body() updatePilgrimDto: UpdatePilgrimDto,
    @Request() req,
  ) {
    const pilgrim = await this.pilgrimsService.update(id, updatePilgrimDto, req.user.tenantId, req.user);
    return {
      success: true,
      data: pilgrim,
      message: 'Pilgrim updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete pilgrim by ID' })
  @ApiResponse({ status: 200, description: 'Pilgrim deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pilgrim not found' })
  @ApiParam({ name: 'id', description: 'Pilgrim ID' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    await this.pilgrimsService.remove(id, req.user.tenantId);
    return {
      success: true,
      message: 'Pilgrim deleted successfully',
    };
  }

  @Post(':id/assign-booking/:bookingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Assign pilgrim to a booking' })
  @ApiResponse({ status: 200, description: 'Pilgrim assigned to booking successfully' })
  @ApiResponse({ status: 404, description: 'Pilgrim or booking not found' })
  @ApiParam({ name: 'id', description: 'Pilgrim ID' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  async assignToBooking(
    @Param('id') pilgrimId: string,
    @Param('bookingId') bookingId: string,
    @Request() req,
  ) {
    const pilgrim = await this.pilgrimsService.assignToBooking(pilgrimId, bookingId, req.user.tenantId);
    return {
      success: true,
      data: pilgrim,
      message: 'Pilgrim assigned to booking successfully',
    };
  }

  @Post(':id/remove-booking')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Remove pilgrim from booking' })
  @ApiResponse({ status: 200, description: 'Pilgrim removed from booking successfully' })
  @ApiResponse({ status: 404, description: 'Pilgrim not found' })
  @ApiParam({ name: 'id', description: 'Pilgrim ID' })
  async removeFromBooking(@Param('id') pilgrimId: string, @Request() req) {
    const pilgrim = await this.pilgrimsService.removeFromBooking(pilgrimId, req.user.tenantId);
    return {
      success: true,
      data: pilgrim,
      message: 'Pilgrim removed from booking successfully',
    };
  }
}