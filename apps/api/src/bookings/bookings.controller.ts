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
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.OPERATION)
  @ApiOperation({ summary: 'Create new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  async create(@Body() createBookingDto: CreateBookingDto, @TenantId() tenantId: string, @Req() req: any) {
    const booking = await this.bookingsService.create(createBookingDto, tenantId, req.user);
    return {
      data: booking,
      message: 'Booking created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings (paginated)' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findAll(
    @Query() query: BookingQueryDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const result = await this.bookingsService.findAll(query, tenantId, req.user);
    return {
      data: result.bookings,
      meta: {
        pagination: result.pagination,
        total: result.total,
      },
      message: 'Bookings retrieved successfully',
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search bookings by code, customer name, or package' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
    @TenantId() tenantId: string,
  ) {
    const bookings = await this.bookingsService.search(query, limit, tenantId);
    return {
      data: bookings,
      message: 'Search results retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    const booking = await this.bookingsService.findOne(id, tenantId);
    return {
      data: booking,
      message: 'Booking retrieved successfully',
    };
  }

  @Get(':id/pilgrims')
  @ApiOperation({ summary: 'Get booking pilgrims' })
  @ApiResponse({ status: 200, description: 'Pilgrims retrieved successfully' })
  async getPilgrims(@Param('id') id: string, @TenantId() tenantId: string) {
    const pilgrims = await this.bookingsService.getPilgrims(id, tenantId);
    return {
      data: pilgrims,
      message: 'Pilgrims retrieved successfully',
    };
  }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.OPERATION)
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const booking = await this.bookingsService.update(id, updateBookingDto, tenantId, req.user);
    return {
      data: booking,
      message: 'Booking updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete booking (soft delete)' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.bookingsService.remove(id, tenantId);
    return {
      message: 'Booking deleted successfully',
    };
  }

  @Post(':id/confirm')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.OPERATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm booking' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  async confirm(@Param('id') id: string, @TenantId() tenantId: string) {
    const booking = await this.bookingsService.changeStatus(id, 'CONFIRMED', tenantId);
    return {
      data: booking,
      message: 'Booking confirmed successfully',
    };
  }

  @Post(':id/cancel')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.OPERATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @TenantId() tenantId: string,
  ) {
    const booking = await this.bookingsService.cancel(id, body.reason, tenantId);
    return {
      data: booking,
      message: 'Booking cancelled successfully',
    };
  }

  @Post(':id/complete')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark booking as completed' })
  @ApiResponse({ status: 200, description: 'Booking marked as completed' })
  async complete(@Param('id') id: string, @TenantId() tenantId: string) {
    const booking = await this.bookingsService.changeStatus(id, 'COMPLETED', tenantId);
    return {
      data: booking,
      message: 'Booking marked as completed',
    };
  }

  @Post(':id/add-pilgrims')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.OPERATION)
  @ApiOperation({ summary: 'Add pilgrims to booking' })
  @ApiResponse({ status: 201, description: 'Pilgrims added successfully' })
  async addPilgrims(
    @Param('id') id: string,
    @Body() body: { pilgrims: any[] },
    @TenantId() tenantId: string,
  ) {
    const pilgrims = await this.bookingsService.addPilgrims(id, body.pilgrims, tenantId);
    return {
      data: pilgrims,
      message: 'Pilgrims added successfully',
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE, UserRole.OPERATION)
  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Query() query: any, @TenantId() tenantId: string) {
    const stats = await this.bookingsService.getStats(query, tenantId);
    return {
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }

  @Get('export/excel')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE, UserRole.OPERATION)
  @ApiOperation({ summary: 'Export bookings to Excel' })
  @ApiResponse({ status: 200, description: 'Bookings exported successfully' })
  async exportToExcel(@Query() query: BookingQueryDto, @TenantId() tenantId: string) {
    const excelBuffer = await this.bookingsService.exportToExcel(query, tenantId);
    return {
      data: excelBuffer,
      message: 'Bookings exported successfully',
    };
  }

  @Post(':id/send-notifications')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send booking notifications' })
  @ApiResponse({ status: 200, description: 'Notifications sent successfully' })
  async sendNotifications(
    @Param('id') id: string,
    @Body() body: { type: 'CONFIRMATION' | 'REMINDER' | 'UPDATE' },
    @TenantId() tenantId: string,
  ) {
    await this.bookingsService.sendNotifications(id, body.type, tenantId);
    return {
      message: 'Notifications sent successfully',
    };
  }

  @Get('calendar/:year/:month')
  @ApiOperation({ summary: 'Get booking calendar for specific month' })
  @ApiResponse({ status: 200, description: 'Calendar data retrieved successfully' })
  async getCalendar(
    @Param('year') year: number,
    @Param('month') month: number,
    @TenantId() tenantId: string,
  ) {
    const calendar = await this.bookingsService.getCalendar(year, month, tenantId);
    return {
      data: calendar,
      message: 'Calendar data retrieved successfully',
    };
  }
}