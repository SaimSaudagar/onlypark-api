import { IsNotEmpty, IsString, IsUUID, IsEmail, IsOptional, IsDateString, IsEnum } from "class-validator";
import { BookingStatus } from "../common/enums";

export class CreateBookingRequest {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    vehicleReg: string;

    @IsNotEmpty()
    @IsUUID()
    tenancyId: string;

    @IsNotEmpty()
    @IsString()
    subCarParkCode: string;

    @IsNotEmpty()
    @IsString()
    property: string;

    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @IsNotEmpty()
    @IsDateString()
    endTime: string;
}

export class UpdateBookingRequest {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    vehicleReg?: string;

    @IsOptional()
    @IsUUID()
    tenancyId?: string;

    @IsOptional()
    @IsString()
    subCarParkCode?: string;

    @IsOptional()
    @IsString()
    property?: string;

    @IsOptional()
    @IsDateString()
    startTime?: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;
}

export class BookingResponse {
    id: string;
    email: string;
    vehicleReg: string;
    tenancyId: string;
    tenancy?: TenancySummary;
    subCarParkCode: string;
    subCarParkId: string;
    subCarPark?: SubCarParkSummary;
    property: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class TenancySummary {
    id: string;
    tenantName: string;
    tenantEmail: string;
}

export class SubCarParkSummary {
    id: string;
    carParkName: string;
    subCarParkCode: string;
    location: string;
    carSpace: number;
}

export class BookingCreateResponse {
    id: string;
    email: string;
    vehicleReg: string;
    subCarParkCode: string;
    property: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: Date;
    message: string;
}

export class BookingUpdateResponse {
    id: string;
    email: string;
    vehicleReg: string;
    subCarParkCode: string;
    property: string;
    startTime: string;
    endTime: string;
    status: string;
    updatedAt: Date;
    message: string;
}

export class BookingDeleteResponse {
    id: string;
    email: string;
    vehicleReg: string;
    message: string;
    deletedAt: Date;
}

export class BookingListResponse {
    id: string;
    email: string;
    vehicleReg: string;
    subCarParkCode: string;
    property: string;
    startTime: string;
    endTime: string;
    status: string;
    tenancyName?: string;
    subCarParkName?: string;
    createdAt: Date;
    updatedAt: Date;
}