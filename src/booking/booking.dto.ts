import { IsNotEmpty, IsString, IsUUID, IsEmail, IsOptional, IsDateString, IsEnum } from "class-validator";

export class CreateBookingRequest {
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsOptional()
    @IsString()
    referenceNumber?: string;

    @IsNotEmpty()
    @IsUUID()
    subCarParkId: string;

    @IsNotEmpty()
    @IsString()
    registrationNo: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsUUID()
    tenancyId: string;

    @IsOptional()
    @IsDateString()
    timeTo?: string;

    @IsOptional()
    @IsDateString()
    timeFrom?: string;

    @IsOptional()
    @IsString()
    comments?: string;
}

export class UpdateBookingRequest extends CreateBookingRequest { }

export class BookingResponse {
    id: string;
    email: string;
    vehicleReg: string;
    tenancyId: string;
    tenancy?: TenancyResponse;
    subCarParkCode: string;
    subCarParkId: string;
    subCarPark?: SubCarParkResponse;
    property: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class TenancyResponse {
    id: string;
    tenantName: string;
    tenantEmail: string;
}

export class SubCarParkResponse {
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