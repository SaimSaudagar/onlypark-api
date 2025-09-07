import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDecimal, IsBoolean, IsDateString, IsUUID, IsArray, IsEmail } from 'class-validator';
import { ParkingSpotStatus } from '../../common/enums';
import { ApiGetBaseRequest } from '../../common/types';

export class CreateSubCarParkRequest {
  @IsNotEmpty()
  @IsUUID()
  masterCarParkId: string;

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
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lang: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  freeHours?: number;

  @IsOptional()
  @IsBoolean()
  tenantEmailCheck?: boolean;

  @IsOptional()
  @IsNumber()
  noOfPermitsPerRegNo?: number;

  @IsOptional()
  @IsBoolean()
  event?: boolean;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsDateString()
  eventExpiryDate?: string;

  @IsOptional()
  @IsArray()
  tenancies?: TenancyRequest[];

  @IsOptional()
  @IsArray()
  whitelistCompanies?: WhitelistCompanyRequest[];
}

export class TenancyRequest {
  @IsNotEmpty()
  @IsString()
  tenantName: string;

  @IsNotEmpty()
  @IsEmail()
  tenantEmail: string;
}

export class WhitelistCompanyRequest {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UpdateSubCarParkRequest extends PartialType(CreateSubCarParkRequest) { }


export class SubCarParkRequest extends ApiGetBaseRequest {
  @IsString()
  @IsOptional()
  name?: string;
}
export class SubCarParkResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  location: string;
  lat: number;
  lang: number;
  description?: string;
  subCarParkCode: string;
  freeHours?: number;
  tenantEmailCheck: boolean;
  geolocation: boolean;
  event: boolean;
  eventDate?: Date;
  eventExpiryDate?: Date;
  status: ParkingSpotStatus;
  masterCarParkId: string;
  tenancies?: TenancyResponse[];
}

export class MasterCarPark {
  id: string;
  carParkName: string;
  masterCarParkCode: string;
  carParkType: string;
  status: string;
}

export class TenancyResponse {
  id: string;
  tenantName: string;
  tenantEmail: string;
}

export class SubCarParkAvailabilityResponse {
  subCarParkId: string;
  carParkName: string;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  status: ParkingSpotStatus;
  freeHours?: number;
  event: boolean;
  eventDate?: Date;
  eventExpiryDate?: Date;
  lastUpdated: Date;
}

export class QrCodeResponse {
  subCarParkId: string;
  subCarParkCode: string;
  carParkName: string;
  masterCarParkId: string;
  qrCode: string;
  generatedAt: Date;
}

export class SubCarParkCreateResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  location: string;
  subCarParkCode: string;
  status: ParkingSpotStatus;
  masterCarParkId: string;
  tenancies: TenancyResponse[];
  whitelistCompanies: WhitelistCompanyResponse[];
  createdAt: Date;
}

export class WhitelistCompanyResponse {
  id: string;
  companyName: string;
  email: string;
}

export class SubCarParkUpdateResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  location: string;
  subCarParkCode: string;
  status: ParkingSpotStatus;
  masterCarParkId: string;
  updatedAt: Date;
}

export class SubCarParkDeleteResponse {
  id: string;
  carParkName: string;
}
