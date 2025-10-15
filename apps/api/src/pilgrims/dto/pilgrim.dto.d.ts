import { Gender, MaritalStatus, IDType } from '@prisma/client';
export declare class CreatePilgrimDto {
    name: string;
    nationality: string;
    place_of_birth: string;
    birth_date: string;
    gender: Gender;
    marital_status: MaritalStatus;
    occupation: string;
    address: string;
    phone: string;
    email?: string;
    id_type: IDType;
    id_number: string;
    passport_number?: string;
    passport_issue_date?: string;
    passport_expiry_date?: string;
    passport_issuing_authority?: string;
    family_relationships?: {
        relationship: string;
        name: string;
        phone?: string;
    }[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    health_conditions?: string;
    food_preferences?: string;
    notes?: string;
}
export declare class UpdatePilgrimDto {
    name?: string;
    nationality?: string;
    place_of_birth?: string;
    birth_date?: string;
    gender?: Gender;
    marital_status?: MaritalStatus;
    occupation?: string;
    address?: string;
    phone?: string;
    email?: string;
    id_type?: IDType;
    id_number?: string;
    passport_number?: string;
    passport_issue_date?: string;
    passport_expiry_date?: string;
    passport_issuing_authority?: string;
    family_relationships?: {
        relationship: string;
        name: string;
        phone?: string;
    }[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    health_conditions?: string;
    food_preferences?: string;
    notes?: string;
}
export declare class PilgrimQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    gender?: Gender;
    nationality?: string;
    marital_status?: MaritalStatus;
    booking_id?: string;
    customer_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
