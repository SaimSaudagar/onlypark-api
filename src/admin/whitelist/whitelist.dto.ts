import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsNumber,
  IsEmail,
  IsIn,
} from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import {
  ApiGetBaseRequest,
  WhitelistStatus,
  WhitelistType,
} from "../../common";

export class CreateWhitelistRequest {
  @IsNotEmpty()
  @IsString()
  registrationNumber: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUUID()
  subCarParkId: string;

  @IsNotEmpty()
  @IsIn([WhitelistType.HOUR, WhitelistType.DATE, WhitelistType.PERMANENT])
  type: WhitelistType;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNotEmpty()
  @IsUUID()
  tenancyId: string;
}

export class CreateWhitelistResponse {
  id: string;
  registrationNumber: string;
  comments?: string;
  email: string;
}

export class UpdateWhitelistRequest extends CreateWhitelistRequest {}

export class UpdateWhitelistResponse {
  id: string;
  registrationNumber: string;
  comments?: string;
  email: string;
}

export class WhitelistResponse {
  id: string;
  registrationNumber: string;
  comments?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  carPark?: {
    id: string;
    name: string;
    code: string;
  };
  tenancy?: {
    id: string;
    name: string;
  };
}

export class FindWhitelistRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([
    WhitelistType.SELF_SERVE,
    WhitelistType.HOUR,
    WhitelistType.DATE,
    WhitelistType.PERMANENT,
  ])
  type?: WhitelistType;
}

export class FindWhitelistResponse {
  id: string;
  registrationNumber: string;
  email: string;
  startDate: Date;
  endDate: Date;
  type: WhitelistType;
  carParkName: string;
  tenancyName: string;
  status: WhitelistStatus;
}
