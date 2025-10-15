"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingQueryDto = exports.UpdateBookingDto = exports.CreateBookingDto = exports.TermsDto = exports.BookingQuerySchema = exports.UpdateBookingSchema = exports.CreateBookingSchema = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const TermsSchema = zod_1.z.object({
    dp: zod_1.z.number(),
    remaining: zod_1.z.number(),
    dueDate: zod_1.z.string(),
});
exports.CreateBookingSchema = zod_1.z.object({
    customer_id: zod_1.z.string(),
    package_id: zod_1.z.string(),
    room_type: zod_1.z.nativeEnum(client_1.RoomType),
    number_of_pilgrims: zod_1.z.number().min(1),
    special_requests: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    departure_date: zod_1.z.string(),
    return_date: zod_1.z.string(),
    terms: TermsSchema,
});
exports.UpdateBookingSchema = zod_1.z.object({
    room_type: zod_1.z.nativeEnum(client_1.RoomType).optional(),
    number_of_pilgrims: zod_1.z.number().min(1).optional(),
    special_requests: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    departure_date: zod_1.z.string().optional(),
    return_date: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.BookingStatus).optional(),
    payment_status: zod_1.z.nativeEnum(client_1.PaymentStatus).optional(),
});
exports.BookingQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.BookingStatus).optional(),
    payment_status: zod_1.z.nativeEnum(client_1.PaymentStatus).optional(),
    room_type: zod_1.z.nativeEnum(client_1.RoomType).optional(),
    package_id: zod_1.z.string().optional(),
    customer_id: zod_1.z.string().optional(),
    departure_from: zod_1.z.string().optional(),
    departure_to: zod_1.z.string().optional(),
    created_from: zod_1.z.string().optional(),
    created_to: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['booking_code', 'status', 'payment_status', 'created_at', 'departure_date']).default('created_at'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
class TermsDto {
}
exports.TermsDto = TermsDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TermsDto.prototype, "dp", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TermsDto.prototype, "remaining", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], TermsDto.prototype, "dueDate", void 0);
class CreateBookingDto {
}
exports.CreateBookingDto = CreateBookingDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateBookingDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateBookingDto.prototype, "package_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.RoomType),
    tslib_1.__metadata("design:type", String)
], CreateBookingDto.prototype, "room_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], CreateBookingDto.prototype, "number_of_pilgrims", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateBookingDto.prototype, "special_requests", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateBookingDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreateBookingDto.prototype, "departure_date", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreateBookingDto.prototype, "return_date", void 0);
class UpdateBookingDto {
}
exports.UpdateBookingDto = UpdateBookingDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.RoomType),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateBookingDto.prototype, "room_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], UpdateBookingDto.prototype, "number_of_pilgrims", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateBookingDto.prototype, "special_requests", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateBookingDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateBookingDto.prototype, "departure_date", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateBookingDto.prototype, "return_date", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateBookingDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateBookingDto.prototype, "payment_status", void 0);
class BookingQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
    }
}
exports.BookingQueryDto = BookingQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], BookingQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], BookingQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "payment_status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.RoomType),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "room_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "package_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "departure_from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "departure_to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "created_from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "created_to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], BookingQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=booking.dto.js.map