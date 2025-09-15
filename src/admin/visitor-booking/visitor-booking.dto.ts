import { IsNotEmpty, IsString, IsUUID, IsEmail, IsOptional, IsDateString, IsEnum } from "class-validator";

export class CreateVisitorBookingRequest {
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

export class UpdateVisitorBookingRequest extends CreateVisitorBookingRequest { }

export class VisitorBookingResponse {
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

export class VisitorBookingCreateResponse {
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

export class VisitorBookingUpdateResponse {
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

export class VisitorBookingDeleteResponse {
    id: string;
    email: string;
    vehicleReg: string;
    message: string;
    deletedAt: Date;
}

export class VisitorBookingListResponse {
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
