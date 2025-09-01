import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlacklistDto {
    @ApiProperty({ description: 'Vehicle registration number' })
    @IsNotEmpty()
    @IsString()
    regNo: string;

    @ApiProperty({ description: 'Email address', required: false })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ description: 'Additional comments', required: false })
    @IsOptional()
    @IsString()
    comments?: string;

    @ApiProperty({ description: 'Sub car park code' })
    @IsNotEmpty()
    @IsString()
    subCarParkCode: string;

    @ApiProperty({ description: 'Status', default: 'active' })
    @IsOptional()
    @IsString()
    status?: string = 'active';
}
