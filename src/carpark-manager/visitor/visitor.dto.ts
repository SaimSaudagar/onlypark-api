import { IsString, IsOptional, IsUUID, IsNotEmpty, IsDate, IsEnum, IsEmail } from 'class-validator';
import { ApiGetBaseRequest, BookingStatus } from '../../common';

export class CreateVisitorRequest {
    @IsUUID()
    @IsNotEmpty()
    subCarParkId: string;

    @IsString()
    @IsNotEmpty()
    registrationNumber: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsUUID()
    @IsNotEmpty()
    tenancyId: string;

    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @IsDate()
    @IsNotEmpty()
    endDate: Date;

    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;
}

export class CreateVisitorResponse {
    id: string;
    registrationNumber: string;
    email: string;
    startDate: Date;
    endDate: Date;
    status: BookingStatus;
    token: string;
}

export class UpdateVisitorRequest extends CreateVisitorRequest { }

export class UpdateVisitorResponse extends CreateVisitorResponse { }

export class FindVisitorRequest extends ApiGetBaseRequest {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsDate()
    dateFrom?: Date;

    @IsOptional()
    @IsDate()
    dateTo?: Date;

    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;
}

export class FindVisitorResponse {
    id: string;
    registrationNumber: string;
    email: string;
    startDate: Date;
    endDate: Date;
    status: BookingStatus;
    token: string;
    createdAt: Date;
    subCarPark: {
        id: string;
        carParkName: string;
    };
    tenancy: {
        id: string;
        tenantName: string;
    };
}

export class GetAssignedSubCarParksResponse {
    subCarParkId: string;
    subCarParkName: string;
}
