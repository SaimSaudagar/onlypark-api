import { IsNotEmpty, IsString, IsUUID, IsEmail, IsOptional, IsDateString, IsEnum } from "class-validator";
import { ApiGetBaseRequest } from "../../common";

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
    registrationNumber: string;

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
    registrationNumber: string;
    tenancyId: string;
    tenancy?: TenancyResponse;
    subCarParkId: string;
    subCarPark?: SubCarParkResponse;
    startTime: string;
    endTime: string;
    status: string;
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
    registrationNumber: string;
    startTime: string;
    endTime: string;
    status: string;
}

export class VisitorBookingUpdateResponse {
    id: string;
    email: string;
    registrationNumber: string;
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
    registrationNumber: string;
    message: string;
    deletedAt: Date;
}

export class FindVisitorBookingRequest extends ApiGetBaseRequest {
    @IsOptional()
    @IsString()
    search?: string;
}

export class FindVisitorBookingResponse {
    id: string;
    email: string;
    registrationNumber: string;
    startTime: string;
    endTime: string;
    status: string;
    tenancyName?: string;
    subCarParkName?: string;
}
