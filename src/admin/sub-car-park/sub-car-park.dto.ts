import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
  IsArray,
  IsEmail,
  ValidateIf,
  IsEnum,
} from "class-validator";
import { ParkingSpotStatus } from "../../common/enums";
import { ApiGetBaseRequest } from "../../common/types";

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

  @ValidateIf((o) => o.event === true)
  @IsNotEmpty()
  @IsDateString()
  eventDate?: string;

  @ValidateIf((o) => o.event === true)
  @IsNotEmpty()
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
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsString()
  tenantName: string;

  @IsNotEmpty()
  @IsEmail()
  tenantEmail: string;
}

export class WhitelistCompanyRequest {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  domainName: string;
}

export class UpdateSubCarParkRequest extends CreateSubCarParkRequest {}

export class FindSubCarParkRequest extends ApiGetBaseRequest {
  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsEnum(ParkingSpotStatus)
  status?: ParkingSpotStatus;
}

export class FindSubCarParkResponse {
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
  whitelistCompanies?: WhitelistCompanyResponse[];
}

export class FindAllSubCarParkResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  status: ParkingSpotStatus;
  location: string;
  lat: number;
  lang: number;
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
}

export class WhitelistCompanyResponse {
  id: string;
  companyName: string;
  domainName: string;
}

export class SubCarParkUpdateResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  location: string;
  subCarParkCode: string;
  status: ParkingSpotStatus;
  masterCarParkId: string;
  tenancies: TenancyResponse[];
  whitelistCompanies: WhitelistCompanyResponse[];
}

export class SubCarParkDeleteResponse {
  id: string;
  carParkName: string;
}
