"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
const ExcelJS = require("exceljs");
let BookingsService = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBookingDto, tenantId, currentUser) {
        const { customer_id, package_id, number_of_pilgrims, departure_date, return_date } = createBookingDto;
        const customer = await this.prisma.customer.findFirst({
            where: { id: customer_id, deleted_at: null },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const packageData = await this.prisma.package.findFirst({
            where: { id: package_id, deleted_at: null, status: 'PUBLISHED' },
        });
        if (!packageData) {
            throw new common_1.NotFoundException('Package not found or not published');
        }
        const now = new Date();
        if (packageData.period_from > now || packageData.period_to < now) {
            throw new common_1.BadRequestException('Package is not currently available');
        }
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
            throw new common_1.BadRequestException(`Insufficient availability. Only ${availableSlots} slots remaining`);
        }
        const bookingCode = this.generateBookingCode();
        const pricing = this.calculatePricing(packageData, createBookingDto.room_type, number_of_pilgrims);
        const totalAmount = pricing.base + pricing.tax + pricing.fees - pricing.discount;
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
    async findAll(query, tenantId, currentUser) {
        const { page = 1, limit = 20, search, status, payment_status, room_type, package_id, customer_id, departure_from, departure_to, created_from, created_to, sortBy = 'created_at', sortOrder = 'desc', } = query;
        const offset = (page - 1) * limit;
        const where = {
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
        const total = await this.prisma.booking.count({ where });
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
    async search(query, limit, tenantId) {
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
    async findOne(id, tenantId) {
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
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async getPilgrims(id, tenantId) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deleted_at: null },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return this.prisma.pilgrim.findMany({
            where: { booking_id: id, deleted_at: null },
            orderBy: { created_at: 'asc' },
        });
    }
    async update(id, updateBookingDto, tenantId, currentUser) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deleted_at: null },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (updateBookingDto.status && currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('You cannot change booking status');
        }
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
    async remove(id, tenantId) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deleted_at: null },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status === 'PAID') {
            throw new common_1.BadRequestException('Cannot delete paid booking');
        }
        if (booking.status === 'CONFIRMED') {
            throw new common_1.BadRequestException('Cannot delete confirmed booking. Cancel it first.');
        }
        await this.prisma.booking.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
    async changeStatus(id, status, tenantId) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deleted_at: null },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
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
    async cancel(id, reason, tenantId) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deleted_at: null },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        if (booking.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot cancel completed booking');
        }
        const updatedBooking = await this.prisma.booking.update({
            where: { id },
            data: {
                status: client_1.BookingStatus.CANCELLED,
                notes: `${booking.notes || ''}\n\n--- Cancellation Reason ---\n${reason || 'No reason provided'}`,
            },
        });
        return updatedBooking;
    }
    async addPilgrims(id, pilgrimsData, tenantId) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deleted_at: null },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const existingPilgrims = await this.prisma.pilgrim.count({
            where: { booking_id: id, deleted_at: null },
        });
        if (existingPilgrims + pilgrimsData.length > booking.number_of_pilgrims) {
            throw new common_1.BadRequestException(`Cannot add more pilgrims. Maximum allowed: ${booking.number_of_pilgrims}`);
        }
        const pilgrims = await Promise.all(pilgrimsData.map((pilgrimData, index) => this.prisma.pilgrim.create({
            data: {
                booking_id: id,
                customer_id: booking.customer_id,
                ...pilgrimData,
                birth_date: new Date(pilgrimData.birth_date),
            },
        })));
        return pilgrims;
    }
    async getStats(query, tenantId) {
        const { period = 'month' } = query;
        let dateFilter = {};
        if (period === 'today') {
            dateFilter = {
                created_at: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            };
        }
        else if (period === 'week') {
            dateFilter = {
                created_at: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            };
        }
        else if (period === 'month') {
            dateFilter = {
                created_at: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            };
        }
        const [totalBookings, bookingsByStatus, bookingsByPaymentStatus, recentBookings, totalRevenue, topPackages,] = await Promise.all([
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
                    status: client_1.BookingStatus.PAID,
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
    async exportToExcel(query, tenantId) {
        const { bookings } = await this.findAll({ ...query, limit: 10000 }, tenantId, null);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bookings');
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
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
    async sendNotifications(id, type, tenantId) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deleted_at: null },
            include: {
                customer: true,
                package: true,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        console.log(`Sending ${type} notification for booking ${id} to customer ${booking.customer.email}`);
    }
    async getCalendar(year, month, tenantId) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
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
    generateBookingCode() {
        const prefix = 'BK';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${date}${random}`;
    }
    calculatePricing(packageData, roomType, numberOfPilgrims) {
        let basePrice = 0;
        switch (roomType) {
            case client_1.RoomType.QUAD:
                basePrice = packageData.price_quad;
                break;
            case client_1.RoomType.TRIPLE:
                basePrice = packageData.price_triple;
                break;
            case client_1.RoomType.DOUBLE:
                basePrice = packageData.price_double;
                break;
            case client_1.RoomType.SINGLE:
                basePrice = packageData.price_single;
                break;
        }
        const totalPrice = basePrice * numberOfPilgrims;
        const taxAmount = Math.round(totalPrice * 0.11);
        const additionalFees = Math.round(totalPrice * 0.02);
        const discountAmount = 0;
        return {
            base: totalPrice,
            tax: taxAmount,
            fees: additionalFees,
            discount: discountAmount,
        };
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [client_1.BookingStatus.DRAFT]: [client_1.BookingStatus.PENDING, client_1.BookingStatus.CANCELLED],
            [client_1.BookingStatus.PENDING]: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.CANCELLED],
            [client_1.BookingStatus.CONFIRMED]: [client_1.BookingStatus.PAID, client_1.BookingStatus.CANCELLED],
            [client_1.BookingStatus.PAID]: [client_1.BookingStatus.COMPLETED],
            [client_1.BookingStatus.COMPLETED]: [],
            [client_1.BookingStatus.CANCELLED]: [],
            [client_1.BookingStatus.REFUNDED]: [],
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map