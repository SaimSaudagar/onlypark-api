import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDecimal, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { CarParkType, ParkingSpotStatus } from '../common/enums';
import { ApiGetBaseRequest } from '../common/types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMasterCarParkRequest {
  @IsNotEmpty()
  @IsString()
  carParkName: string;

  @IsNotEmpty()
  @IsEnum(CarParkType)
  carParkType: CarParkType;
}

export class UpdateMasterCarParkRequest extends PartialType(CreateMasterCarParkRequest) { }

export class CreateMasterCarParkResponse {
  id: string;
  carParkName: string;
  carParkType: CarParkType;
  masterCarParkCode: string;
  status: ParkingSpotStatus;
}

export class FindMasterCarParkRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  carParkName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['carParkName'])
  sortField?: string;
}

export class FindMasterCarParkResponse {
  id: string;
  carParkName: string;
  masterCarParkCode: string;
  carParkType: CarParkType;
  status: ParkingSpotStatus;
  subCarParks?: SubCarParkResponse[];
}

export interface SubCarParkResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  status: ParkingSpotStatus;
}
