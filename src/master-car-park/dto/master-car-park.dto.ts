import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDecimal, IsBoolean, IsDateString } from 'class-validator';
import { CarParkType, ParkingSpotStatus } from '../../common/enums';

export class CreateMasterCarParkRequest {
  @IsNotEmpty()
  @IsString()
  carParkName: string;

  @IsNotEmpty()
  @IsNumber()
  totalCarSpace: number;

  @IsNotEmpty()
  @IsEnum(CarParkType)
  carParkType: CarParkType;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsDecimal()
  lat: number;

  @IsNotEmpty()
  @IsDecimal()
  lang: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  carParkCode?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsNumber()
  operatingHours?: number;

  @IsOptional()
  @IsBoolean()
  tenantEmailCheck?: boolean;

  @IsOptional()
  @IsBoolean()
  geolocation?: boolean;

  @IsOptional()
  @IsBoolean()
  event?: boolean;

  @IsOptional()
  @IsDateString()
  eventDate?: Date;

  @IsOptional()
  @IsDateString()
  eventExpiryDate?: Date;

  @IsOptional()
  @IsEnum(ParkingSpotStatus)
  status?: ParkingSpotStatus;
}

export class UpdateMasterCarParkRequest extends PartialType(CreateMasterCarParkRequest) {}

export interface GetMasterCarParkResponse {
  id: string;
  carParkName: string;
  totalCarSpace: number;
  carParkType: CarParkType;
  location: string;
  lat: number;
  lang: number;
  description?: string;
  carParkCode: string;
  slug: string;
  operatingHours?: number;
  tenantEmailCheck: boolean;
  geolocation: boolean;
  event: boolean;
  eventDate?: Date;
  eventExpiryDate?: Date;
  status: ParkingSpotStatus;
  createdAt: Date;
  updatedAt: Date;
  subCarParks?: SubCarParkSummary[];
}

export interface SubCarParkSummary {
  id: string;
  carParkName: string;
  carSpace: number;
  spotType: string;
  status: string;
}
