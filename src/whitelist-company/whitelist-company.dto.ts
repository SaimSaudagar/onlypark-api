import { IsNotEmpty, IsString, IsOptional, IsUUID, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateWhitelistCompanyDto {
    @IsNotEmpty()
    @IsString()
    companyName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsUUID()
    subCarParkId: string;
}

export class UpdateWhitelistCompanyDto extends PartialType(CreateWhitelistCompanyDto) { }

export class WhitelistCompanyResponseDto {
    id: string;
    companyName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    subCarPark?: {
        id: string;
        name: string;
        code: string;
    };
}
