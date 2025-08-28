import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDecimal, IsBoolean, IsDateString, IsUUID } from 'class-validator';
import { SpotType, ParkingSpotStatus } from '../../common/enums';

export class CreateSubCarParkRequest {
  @IsNotEmpty()
  @IsString()
  carParkName: string;

  @IsNotEmpty()
  @IsNumber()
  carSpace: number;

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
  hours?: number;

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

  @IsNotEmpty()
  @IsEnum(SpotType)
  spotType: SpotType;

  @IsOptional()
  @IsEnum(ParkingSpotStatus)
  status?: ParkingSpotStatus;

  @IsNotEmpty()
  @IsUUID()
  masterCarParkId: string;
}

export class UpdateSubCarParkRequest extends PartialType(CreateSubCarParkRequest) {}

export interface GetSubCarParkResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  location: string;
  lat: number;
  lang: number;
  description?: string;
  carParkCode: string;
  slug: string;
  hours?: number;
  tenantEmailCheck: boolean;
  geolocation: boolean;
  event: boolean;
  eventDate?: Date;
  eventExpiryDate?: Date;
  spotType: SpotType;
  status: ParkingSpotStatus;
  masterCarParkId: string;
  masterCarPark?: MasterCarParkSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterCarParkSummary {
  id: string;
  carParkName: string;
  carParkCode: string;
  location: string;
}
