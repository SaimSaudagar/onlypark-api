import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ParkingSpotStatus } from '../../common/enums';

export class FindMasterCarParkRequest {
    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    pageNo?: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    pageSize?: number = 10;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    sortField?: string;

    @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    carParkType?: string;

    @ApiProperty({ required: false, enum: ParkingSpotStatus })
    @IsOptional()
    @IsEnum(ParkingSpotStatus)
    status?: ParkingSpotStatus;
}

export class FindMasterCarParkResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    carParkName: string;

    @ApiProperty()
    carParkType: string;

    @ApiProperty()
    carParkCode: string;

    @ApiProperty()
    status: string;

    @ApiProperty({ type: [Object] })
    subCarParks: {
        id: string;
        carParkName: string;
        carSpace: number;
        status: string;
    }[];
}
