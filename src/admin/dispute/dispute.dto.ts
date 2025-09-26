import { IsString, IsOptional, IsEnum, IsObject, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { DisputeStatus } from '../../common/enums';
import { ApiGetBaseRequest } from '../../common';

export class CreateDisputeRequest {
    @IsString()
    @IsNotEmpty()
    registrationNo: string;

    @IsNumber()
    @IsNotEmpty()
    ticketNumber: number;

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @IsString()
    @IsNotEmpty()
    mobileNumber: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    carMakeId?: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsString()
    @IsNotEmpty()
    appeal: string;

    @IsObject()
    @IsOptional()
    photos?: object;
}

export class UpdateDisputeRequest {
    @IsString()
    @IsOptional()
    responseReason?: string;

    @IsObject()
    @IsOptional()
    responsePhotos?: object;

    @IsEnum(DisputeStatus)
    @IsOptional()
    status?: DisputeStatus;
}

export class CreateDisputeResponse {
    id: string;
    infringementId: string;
    registrationNo: string;
    status: DisputeStatus;
}

export class UpdateDisputeResponse {
    id: string;
    status: DisputeStatus;
    responseReason?: string;
    responsePhotos?: object;
}

export class UpdateDisputeStatusRequest {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsEnum(DisputeStatus)
    @IsNotEmpty()
    status: DisputeStatus;

    @IsString()
    @IsNotEmpty()
    responseReason?: string;
}


export class FindDisputeRequest extends ApiGetBaseRequest {
    @IsEnum(DisputeStatus)
    @IsOptional()
    status?: DisputeStatus;

    @IsString()
    @IsOptional()
    search?: string;
}

export class FindDisputeResponse {
    id: string;
    registrationNo: string;
    email: string;
    date: string;
    status: DisputeStatus;
}

export class FindOneDisputeResponse {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    carMakeName: string;
    model: string;
    address: string;
    state: string;
    zipCode: string;
    mobileNumber: string;
    registrationNo: string;
    email: string;
    appeal: string;
    photos: object;
    carParkName: string;
    date: string;
    status: DisputeStatus;
}
