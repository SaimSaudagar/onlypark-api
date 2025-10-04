import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsNumber, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiGetBaseRequest, WhitelistStatus, WhitelistType } from 'src/common';

export class CreateWhitelistRequest {
    @IsNotEmpty()
    @IsString()
    registrationNumber: string;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsUUID()
    subCarParkId?: string;

    @IsOptional()
    @IsEnum(WhitelistType)
    type: WhitelistType;

    @IsOptional()
    @IsNumber()
    duration?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsUUID()
    tenancyId?: string;
}

export class CreateWhitelistResponse {
    id: string;
    registrationNumber: string;
    comments?: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export class UpdateWhitelistDto extends PartialType(CreateWhitelistRequest) { }

export class WhitelistResponse {
    id: string;
    registrationNumber: string;
    comments?: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    carPark?: {
        id: string;
        name: string;
        code: string;
    };
    tenancy?: {
        id: string;
        name: string;
    };
}

export class FindWhitelistRequest extends ApiGetBaseRequest {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(WhitelistType)
    type?: WhitelistType;
}

export class FindWhitelistResponse {
    id: string;
    registrationNumber: string;
    email: string;
    startDate: Date;
    endDate: Date;
    type: WhitelistType;
    carParkName: string;
    tenancyName: string;
    status: WhitelistStatus;
}