import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDecimal, IsBoolean, IsDateString } from 'class-validator';
import { CarParkType, ParkingSpotStatus } from '../../common/enums';

export class CreateMasterCarParkRequest {
  @IsNotEmpty()
  @IsString()
  carParkName: string;

  @IsNotEmpty()
  @IsEnum(CarParkType)
  carParkType: CarParkType;
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
  subCarParkCode: string;
  freeHours?: number;
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
