import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateWhitelistDto {
    @ApiProperty({ description: 'Vehicle registration number' })
    @IsNotEmpty()
    @IsString()
    vehicalRegistration: string;

    @ApiPropertyOptional({ description: 'Additional comments' })
    @IsOptional()
    @IsString()
    comments?: string;

    @ApiProperty({ description: 'Email address' })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiPropertyOptional({ description: 'Sub car park ID' })
    @IsOptional()
    @IsUUID()
    subCarParkId?: string;

    @ApiPropertyOptional({ description: 'Tenancy ID' })
    @IsOptional()
    @IsUUID()
    tenancyId?: string;
}

export class UpdateWhitelistDto extends PartialType(CreateWhitelistDto) { }

export class WhitelistResponseDto {
    @ApiProperty({ description: 'Whitelist unique identifier' })
    id: string;

    @ApiProperty({ description: 'Vehicle registration number' })
    vehicalRegistration: string;

    @ApiPropertyOptional({ description: 'Additional comments' })
    comments?: string;

    @ApiProperty({ description: 'Email address' })
    email: string;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Associated car park information' })
    carPark?: {
        id: string;
        name: string;
        code: string;
    };

    @ApiPropertyOptional({ description: 'Associated tenancy information' })
    tenancy?: {
        id: string;
        name: string;
    };
}
