import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from './dto/booking.dto';
import { BookingStatus, PaymentStatus, RoomType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as ExcelJS from 'exceljs';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, tenantId: string, currentUser: any) {
    const { customer_id, package_id, number_of_pilgrims, departure_date, return_date } = createBookingDto;

    // Verify customer exists
    const customer = await this.prisma.customer.findFirst({
      where: { id: customer_id, deleted_at: null },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verify package exists and is available
    const packageData = await this.prisma.package.findFirst({
      where: { id: package_id, deleted_at: null, status: 'PUBLISHED' },
    });

    if (!packageData) {
      throw new NotFoundException('Package not found or not published');
    }

    // Check if package is within valid dates
    const now = new Date();
    if (packageData.period_from > now || packageData.period_to < now) {
      throw new BadRequestException('Package is not currently available');
    }

    // Check availability
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        package_id,
        status: { in: ['CONFIRMED', 'PAID'] },
        deleted_at: null,
      },
      include: {
        _count: { select: { pilgrims: true } },
      },
    });

    const totalBookedPilgrims = existingBookings.reduce((sum, booking) => sum + booking._count.pilgrims, 0);
    const availableSlots = packageData.quota - totalBookedPilgrims;

    if (availableSlots < number_of_pilgrims) {
      throw new BadRequestException(`Insufficient availability. Only ${availableSlots} slots remaining`);
    }

    // Generate unique booking code
    const bookingCode = this.generateBookingCode();

    // Calculate pricing based on room type and package prices
    const pricing = this.calculatePricing(packageData, createBookingDto.room_type, number_of_pilgrims);
    const totalAmount = pricing.base + pricing.tax + pricing.fees - pricing.discount;

    // Create booking
    const booking = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.booking.create({
        data: {
          tenant_id: tenantId,
          booking_code: bookingCode,
          customer_id,
          package_id,
          room_type: createBookingDto.room_type,
          number_of_pilgrims,
          special_requests: createBookingDto.special_requests,
          notes: createBookingDto.notes,
          base_price: pricing.base,
          tax_amount: pricing.tax,
          additional_fees: pricing.fees,
          discount_amount: pricing.discount,
          total_price: totalAmount,
          dp_amount: createBookingDto.terms?.dp || 0,
          remaining_amount: totalAmount - (createBookingDto.terms?.dp || 0),
          departure_date: new Date(departure_date),
          return_date: new Date(return_date),
          created_by: currentUser.id,
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          package: { select: { id: true, name: true, code: true } },
        },
      });
    });

    return booking;
  }

  async findAll(query: BookingQueryDto, tenantId: string, currentUser: any) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      payment_status,
      room_type,
      package_id,
      customer_id,
      departure_from,
      departure_to,
      created_from,
      created_to,
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
        { booking_code: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { package: { name: { contains: search, mode: 'insensitive' } } },
        { package: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (room_type) {
      where.room_type = room_type;
    }

    if (package_id) {
      where.package_id = package_id;
    }

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (departure_from || departure_to) {
      where.departure_date = {};
      if (departure_from) {
        where.departure_date.gte = new Date(departure_from);
      }
      if (departure_to) {
        where.departure_date.lte = new Date(departure_to);
      }
    }

    if (created_from || created_to) {
      where.created_at = {};
      if (created_from) {
        where.created_at.gte = new Date(created_from);
      }
      if (created_to) {
        where.created_at.lte = new Date(created_to);
      }
    }

    // Get total count
    const total = await this.prisma.booking.count({ where });

    // Get bookings with pagination
    const bookings = await this.prisma.booking.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        package: {
          select: { id: true, name: true, code: true, period_from: true, period_to: true },
        },
        _count: {
          select: { pilgrims: true },
        },
      },
    });

    return {
      bookings,
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
    return this.prisma.booking.findMany({
      where: {
        deleted_at: null,
        OR: [
          { booking_code: { contains: query, mode: 'insensitive' } },
          { customer: { name: { contains: query, mode: 'insensitive' } } },
          { package: { name: { contains: query, mode: 'insensitive' } } },
          { package: { code: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        package: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        package: { select: { id: true, name: true, code: true } },
        pilgrims: true,
        invoices: true,
        payments: true,
        creator: { select: { id: true, name: true } },
        updater: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getPilgrims(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.pilgrim.findMany({
      where: { booking_id: id, deleted_at: null },
      orderBy: { created_at: 'asc' },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, tenantId: string, currentUser: any) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Restrict status changes based on user role
    if (updateBookingDto.status && currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot change booking status');
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        ...updateBookingDto,
        updated_by: currentUser.id,
        ...(updateBookingDto.departure_date && {
          departure_date: new Date(updateBookingDto.departure_date),
        }),
        ...(updateBookingDto.return_date && {
          return_date: new Date(updateBookingDto.return_date),
        }),
      },
      include: {
        customer: { select: { id: true, name: true } },
        package: { select: { id: true, name: true, code: true } },
      },
    });

    return updatedBooking;
  }

  async remove(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if booking can be deleted (no paid invoices or confirmed status)
    if (booking.status === 'PAID') {
      throw new BadRequestException('Cannot delete paid booking');
    }

    if (booking.status === 'CONFIRMED') {
      throw new BadRequestException('Cannot delete confirmed booking. Cancel it first.');
    }

    // Soft delete
    await this.prisma.booking.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async changeStatus(id: string, status: BookingStatus, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate status transitions
    this.validateStatusTransition(booking.status, status);

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONFIRMED' && { confirmation_date: new Date() }),
      },
    });

    return updatedBooking;
  }

  async cancel(id: string, reason?: string, tenantId?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        notes: `${booking.notes || ''}\n\n--- Cancellation Reason ---\n${reason || 'No reason provided'}`,
      },
    });

    return updatedBooking;
  }

  async addPilgrims(id: string, pilgrimsData: any[], tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if adding more pilgrims exceeds the booking count
    const existingPilgrims = await this.prisma.pilgrim.count({
      where: { booking_id: id, deleted_at: null },
    });

    if (existingPilgrims + pilgrimsData.length > booking.number_of_pilgrims) {
      throw new BadRequestException(`Cannot add more pilgrims. Maximum allowed: ${booking.number_of_pilgrims}`);
    }

    // Create pilgrims
    const pilgrims = await Promise.all(
      pilgrimsData.map((pilgrimData, index) =>
        this.prisma.pilgrim.create({
          data: {
            booking_id: id,
            customer_id: booking.customer_id,
            ...pilgrimData,
            birth_date: new Date(pilgrimData.birth_date),
          },
        })
      )
    );

    return pilgrims;
  }

  async getStats(query: any, tenantId: string) {
    const { period = 'month' } = query;
    let dateFilter = {};

    if (period === 'today') {
      dateFilter = {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      };
    } else if (period === 'week') {
      dateFilter = {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      };
    } else if (period === 'month') {
      dateFilter = {
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      };
    }

    const [
      totalBookings,
      bookingsByStatus,
      bookingsByPaymentStatus,
      recentBookings,
      totalRevenue,
      topPackages,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: { deleted_at: null, ...dateFilter },
      }),
      this.prisma.booking.groupBy({
        by: ['status'],
        where: { deleted_at: null, ...dateFilter },
        _count: { status: true },
      }),
      this.prisma.booking.groupBy({
        by: ['payment_status'],
        where: { deleted_at: null, ...dateFilter },
        _count: { payment_status: true },
      }),
      this.prisma.booking.count({
        where: {
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          deleted_at: null,
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          status: BookingStatus.PAID,
          deleted_at: null,
          ...dateFilter,
        },
        _sum: { total_price: true },
      }),
      this.prisma.booking.groupBy({
        by: ['package_id'],
        where: { deleted_at: null, ...dateFilter },
        _count: { package_id: true },
        orderBy: { _count: { package_id: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      total: totalBookings,
      byStatus: bookingsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      byPaymentStatus: bookingsByPaymentStatus.map(item => ({
        status: item.payment_status,
        count: item._count.payment_status,
      })),
      recentCount: recentBookings,
      totalRevenue: totalRevenue._sum.total_price || 0,
      topPackages: topPackages.map(item => ({
        package_id: item.package_id,
        count: item._count.package_id,
      })),
    };
  }

  async exportToExcel(query: BookingQueryDto, tenantId: string) {
    const { bookings } = await this.findAll(
      { ...query, limit: 10000 }, // Large limit for export
      tenantId,
      null,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');

    // Add headers
    worksheet.columns = [
      { header: 'Booking Code', key: 'booking_code', width: 20 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Package Name', key: 'package_name', width: 30 },
      { header: 'Package Code', key: 'package_code', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Payment Status', key: 'payment_status', width: 15 },
      { header: 'Room Type', key: 'room_type', width: 15 },
      { header: 'Number of Pilgrims', key: 'number_of_pilgrims', width: 20 },
      { header: 'Total Price', key: 'total_price', width: 15 },
      { header: 'DP Amount', key: 'dp_amount', width: 15 },
      { header: 'Remaining Amount', key: 'remaining_amount', width: 20 },
      { header: 'Departure Date', key: 'departure_date', width: 15 },
      { header: 'Return Date', key: 'return_date', width: 15 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];

    // Add data
    bookings.forEach((booking) => {
      worksheet.addRow({
        booking_code: booking.booking_code,
        customer_name: booking.customer.name,
        package_name: booking.package.name,
        package_code: booking.package.code,
        status: booking.status,
        payment_status: booking.payment_status,
        room_type: booking.room_type,
        number_of_pilgrims: booking.number_of_pilgrims,
        total_price: booking.total_price,
        dp_amount: booking.dp_amount,
        remaining_amount: booking.remaining_amount,
        departure_date: booking.departure_date.toISOString().split('T')[0],
        return_date: booking.return_date.toISOString().split('T')[0],
        created_at: booking.created_at.toISOString().split('T')[0],
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async sendNotifications(id: string, type: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, deleted_at: null },
      include: {
        customer: true,
        package: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // This would integrate with the notification system
    // For now, we'll just log the action
    console.log(`Sending ${type} notification for booking ${id} to customer ${booking.customer.email}`);

    // TODO: Implement actual notification sending
    // await this.notificationService.sendBookingNotification(booking, type, tenantId);
  }

  async getCalendar(year: number, month: number, tenantId: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const bookings = await this.prisma.booking.findMany({
      where: {
        deleted_at: null,
        departure_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: { select: { name: true } },
        package: { select: { name: true, code: true } },
      },
      orderBy: { departure_date: 'asc' },
    });

    return bookings.map(booking => ({
      id: booking.id,
      title: `${booking.customer.name} - ${booking.package.name}`,
      date: booking.departure_date,
      status: booking.status,
      customerName: booking.customer.name,
      packageCode: booking.package.code,
    }));
  }

  private generateBookingCode(): string {
    const prefix = 'BK';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${date}${random}`;
  }

  private calculatePricing(packageData: any, roomType: RoomType, numberOfPilgrims: number) {
    let basePrice = 0;

    // Get price based on room type
    switch (roomType) {
      case RoomType.QUAD:
        basePrice = packageData.price_quad;
        break;
      case RoomType.TRIPLE:
        basePrice = packageData.price_triple;
        break;
      case RoomType.DOUBLE:
        basePrice = packageData.price_double;
        break;
      case RoomType.SINGLE:
        basePrice = packageData.price_single;
        break;
    }

    // Multiply by number of pilgrims (per person pricing)
    const totalPrice = basePrice * numberOfPilgrims;

    // Calculate tax (assuming 11% VAT)
    const taxAmount = Math.round(totalPrice * 0.11);

    // Additional fees (e.g., handling, insurance)
    const additionalFees = Math.round(totalPrice * 0.02); // 2% handling fee

    // Discount (if any)
    const discountAmount = 0; // Can be calculated based on promotions

    return {
      base: totalPrice,
      tax: taxAmount,
      fees: additionalFees,
      discount: discountAmount,
    };
  }

  private validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus) {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.DRAFT]: [BookingStatus.PENDING, BookingStatus.CANCELLED],
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.PAID, BookingStatus.CANCELLED],
      [BookingStatus.PAID]: [BookingStatus.COMPLETED],
      [BookingStatus.COMPLETED]: [], // Final state
      [BookingStatus.CANCELLED]: [], // Final state
      [BookingStatus.REFUNDED]: [], // Final state
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}