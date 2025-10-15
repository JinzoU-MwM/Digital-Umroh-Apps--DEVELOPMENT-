"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PilgrimQueryDto = exports.UpdatePilgrimDto = exports.CreatePilgrimDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreatePilgrimDto {
}
exports.CreatePilgrimDto = CreatePilgrimDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name of the pilgrim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nationality' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "nationality", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Place of birth' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "place_of_birth", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "birth_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender' }),
    (0, class_validator_1.IsEnum)(client_1.Gender),
    tslib_1.__metadata("design:type", typeof (_a = typeof client_1.Gender !== "undefined" && client_1.Gender) === "function" ? _a : Object)
], CreatePilgrimDto.prototype, "gender", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Marital status' }),
    (0, class_validator_1.IsEnum)(client_1.MaritalStatus),
    tslib_1.__metadata("design:type", typeof (_b = typeof client_1.MaritalStatus !== "undefined" && client_1.MaritalStatus) === "function" ? _b : Object)
], CreatePilgrimDto.prototype, "marital_status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Occupation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "occupation", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mobile phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of identification document' }),
    (0, class_validator_1.IsEnum)(client_1.IDType),
    tslib_1.__metadata("design:type", typeof (_c = typeof client_1.IDType !== "undefined" && client_1.IDType) === "function" ? _c : Object)
], CreatePilgrimDto.prototype, "id_type", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Identification document number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "id_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "passport_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport issue date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "passport_issue_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport expiry date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "passport_expiry_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport issuing authority' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "passport_issuing_authority", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Family relationships' }),
    (0, class_validator_1.IsArray)(),
    tslib_1.__metadata("design:type", Array)
], CreatePilgrimDto.prototype, "family_relationships", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "emergency_contact_name", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "emergency_contact_phone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact relationship' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "emergency_contact_relationship", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Health conditions or special needs' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "health_conditions", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Food preferences or allergies' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "food_preferences", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], CreatePilgrimDto.prototype, "notes", void 0);
class UpdatePilgrimDto {
}
exports.UpdatePilgrimDto = UpdatePilgrimDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full name of the pilgrim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nationality' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "nationality", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Place of birth' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "place_of_birth", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date of birth' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "birth_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender' }),
    (0, class_validator_1.IsEnum)(client_1.Gender),
    tslib_1.__metadata("design:type", typeof (_d = typeof client_1.Gender !== "undefined" && client_1.Gender) === "function" ? _d : Object)
], UpdatePilgrimDto.prototype, "gender", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Marital status' }),
    (0, class_validator_1.IsEnum)(client_1.MaritalStatus),
    tslib_1.__metadata("design:type", typeof (_e = typeof client_1.MaritalStatus !== "undefined" && client_1.MaritalStatus) === "function" ? _e : Object)
], UpdatePilgrimDto.prototype, "marital_status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Occupation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "occupation", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mobile phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Type of identification document' }),
    (0, class_validator_1.IsEnum)(client_1.IDType),
    tslib_1.__metadata("design:type", typeof (_f = typeof client_1.IDType !== "undefined" && client_1.IDType) === "function" ? _f : Object)
], UpdatePilgrimDto.prototype, "id_type", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Identification document number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "id_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "passport_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport issue date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "passport_issue_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport expiry date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "passport_expiry_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport issuing authority' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "passport_issuing_authority", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Family relationships' }),
    (0, class_validator_1.IsArray)(),
    tslib_1.__metadata("design:type", Array)
], UpdatePilgrimDto.prototype, "family_relationships", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "emergency_contact_name", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "emergency_contact_phone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact relationship' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "emergency_contact_relationship", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Health conditions or special needs' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "health_conditions", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Food preferences or allergies' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "food_preferences", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], UpdatePilgrimDto.prototype, "notes", void 0);
class PilgrimQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
    }
}
exports.PilgrimQueryDto = PilgrimQueryDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], PilgrimQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page', default: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], PilgrimQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by name, ID number, or phone' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PilgrimQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by gender' }),
    (0, class_validator_1.IsEnum)(client_1.Gender),
    tslib_1.__metadata("design:type", typeof (_g = typeof client_1.Gender !== "undefined" && client_1.Gender) === "function" ? _g : Object)
], PilgrimQueryDto.prototype, "gender", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by nationality' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PilgrimQueryDto.prototype, "nationality", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by marital status' }),
    (0, class_validator_1.IsEnum)(client_1.MaritalStatus),
    tslib_1.__metadata("design:type", typeof (_h = typeof client_1.MaritalStatus !== "undefined" && client_1.MaritalStatus) === "function" ? _h : Object)
], PilgrimQueryDto.prototype, "marital_status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by booking ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PilgrimQueryDto.prototype, "booking_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by customer ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PilgrimQueryDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field', default: 'created_at' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PilgrimQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', default: 'desc' }),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    tslib_1.__metadata("design:type", String)
], PilgrimQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=pilgrim.dto.js.map