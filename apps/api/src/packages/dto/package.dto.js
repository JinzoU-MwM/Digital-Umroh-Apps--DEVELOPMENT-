"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageQueryDto = exports.UpdatePackageDto = exports.CreatePackageDto = exports.ItineraryDto = exports.FlightDto = exports.HotelDto = exports.MoneyDto = exports.PackageQuerySchema = exports.UpdatePackageSchema = exports.CreatePackageSchema = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const MoneySchema = zod_1.z.object({
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
});
const HotelSchema = zod_1.z.object({
    name: zod_1.z.string(),
    city: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    checkin: zod_1.z.string(),
    checkout: zod_1.z.string(),
    room_type: zod_1.z.enum(['QUAD', 'TRIPLE', 'DOUBLE', 'SINGLE']),
});
const FlightSchema = zod_1.z.object({
    airline: zod_1.z.string(),
    flight_number: zod_1.z.string(),
    from: zod_1.z.string(),
    to: zod_1.z.string(),
    departure: zod_1.z.string(),
    arrival: zod_1.z.string(),
    type: zod_1.z.enum(['DEPARTURE', 'RETURN']),
});
const ItinerarySchema = zod_1.z.object({
    day: zod_1.z.number(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    time: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
});
exports.CreatePackageSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200),
    code: zod_1.z.string().min(3).max(20),
    type: zod_1.z.nativeEnum(client_1.PackageType),
    description: zod_1.z.string().optional(),
    period_from: zod_1.z.string(),
    period_to: zod_1.z.string(),
    quota: zod_1.z.number().min(1),
    hotels: zod_1.z.array(HotelSchema).default([]),
    flights: zod_1.z.array(FlightSchema).default([]),
    itinerary: zod_1.z.array(ItinerarySchema).default([]),
    price_quad: MoneySchema,
    price_triple: MoneySchema,
    price_double: MoneySchema,
    price_single: MoneySchema,
    inclusions: zod_1.z.array(zod_1.z.string()).default([]),
    exclusions: zod_1.z.array(zod_1.z.string()).default([]),
    terms: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    featured_image_url: zod_1.z.string().optional(),
    gallery_images: zod_1.z.array(zod_1.z.string()).default([]),
    documents_required: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.UpdatePackageSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200).optional(),
    code: zod_1.z.string().min(3).max(20).optional(),
    type: zod_1.z.nativeEnum(client_1.PackageType).optional(),
    description: zod_1.z.string().optional(),
    period_from: zod_1.z.string().optional(),
    period_to: zod_1.z.string().optional(),
    quota: zod_1.z.number().min(1).optional(),
    hotels: zod_1.z.array(HotelSchema).optional(),
    flights: zod_1.z.array(FlightSchema).optional(),
    itinerary: zod_1.z.array(ItinerarySchema).optional(),
    price_quad: MoneySchema.optional(),
    price_triple: MoneySchema.optional(),
    price_double: MoneySchema.optional(),
    price_single: MoneySchema.optional(),
    inclusions: zod_1.z.array(zod_1.z.string()).optional(),
    exclusions: zod_1.z.array(zod_1.z.string()).optional(),
    terms: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    featured_image_url: zod_1.z.string().optional(),
    gallery_images: zod_1.z.array(zod_1.z.string()).optional(),
    documents_required: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.PackageQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.PackageType).optional(),
    status: zod_1.z.nativeEnum(client_1.PackageStatus).optional(),
    price_min: zod_1.z.number().optional(),
    price_max: zod_1.z.number().optional(),
    period_from: zod_1.z.string().optional(),
    period_to: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['name', 'code', 'type', 'status', 'period_from', 'quota', 'created_at']).default('created_at'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
class MoneyDto {
}
exports.MoneyDto = MoneyDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], MoneyDto.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], MoneyDto.prototype, "currency", void 0);
class HotelDto {
}
exports.HotelDto = HotelDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], HotelDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], HotelDto.prototype, "city", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    tslib_1.__metadata("design:type", Number)
], HotelDto.prototype, "rating", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], HotelDto.prototype, "checkin", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], HotelDto.prototype, "checkout", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], HotelDto.prototype, "room_type", void 0);
class FlightDto {
}
exports.FlightDto = FlightDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FlightDto.prototype, "airline", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FlightDto.prototype, "flight_number", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FlightDto.prototype, "from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FlightDto.prototype, "to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FlightDto.prototype, "departure", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FlightDto.prototype, "arrival", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FlightDto.prototype, "type", void 0);
class ItineraryDto {
}
exports.ItineraryDto = ItineraryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], ItineraryDto.prototype, "day", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ItineraryDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ItineraryDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], ItineraryDto.prototype, "time", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], ItineraryDto.prototype, "location", void 0);
class CreatePackageDto {
}
exports.CreatePackageDto = CreatePackageDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "code", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.PackageType),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "period_from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "period_to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], CreatePackageDto.prototype, "quota", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreatePackageDto.prototype, "hotels", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreatePackageDto.prototype, "flights", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreatePackageDto.prototype, "itinerary", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreatePackageDto.prototype, "inclusions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreatePackageDto.prototype, "exclusions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "terms", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreatePackageDto.prototype, "featured_image_url", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreatePackageDto.prototype, "gallery_images", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreatePackageDto.prototype, "documents_required", void 0);
class UpdatePackageDto {
}
exports.UpdatePackageDto = UpdatePackageDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "code", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.PackageType),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "period_from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "period_to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], UpdatePackageDto.prototype, "quota", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePackageDto.prototype, "hotels", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePackageDto.prototype, "flights", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePackageDto.prototype, "itinerary", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", MoneyDto)
], UpdatePackageDto.prototype, "price_quad", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", MoneyDto)
], UpdatePackageDto.prototype, "price_triple", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", MoneyDto)
], UpdatePackageDto.prototype, "price_double", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", MoneyDto)
], UpdatePackageDto.prototype, "price_single", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePackageDto.prototype, "inclusions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePackageDto.prototype, "exclusions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "terms", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdatePackageDto.prototype, "featured_image_url", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePackageDto.prototype, "gallery_images", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePackageDto.prototype, "documents_required", void 0);
class PackageQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
    }
}
exports.PackageQueryDto = PackageQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], PackageQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], PackageQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], PackageQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.PackageType),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], PackageQueryDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.PackageStatus),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], PackageQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], PackageQueryDto.prototype, "price_min", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], PackageQueryDto.prototype, "price_max", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], PackageQueryDto.prototype, "period_from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], PackageQueryDto.prototype, "period_to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], PackageQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], PackageQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=package.dto.js.map