import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateWhitelistDto {
    @IsNotEmpty()
    @IsString()
    vehicalRegistration: string;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsOptional()
    @IsUUID()
    subCarParkId?: string;

    @IsOptional()
    @IsUUID()
    tenancyId?: string;
}

export class UpdateWhitelistDto extends PartialType(CreateWhitelistDto) { }

export class WhitelistResponseDto {
    id: string;
    vehicalRegistration: string;
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
