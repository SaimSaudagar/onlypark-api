import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsEmail,
  IsIn,
  IsNumber,
} from "class-validator";
import {
  ApiGetBaseRequest,
  WhitelistStatus,
  WhitelistType,
} from "../../common";

export class CreateWhitelistRequest {
  @IsUUID()
  @IsNotEmpty()
  subCarParkId: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsNotEmpty()
  @IsIn([WhitelistType.HOUR, WhitelistType.DATE, WhitelistType.PERMANENT])
  type: WhitelistType;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsUUID()
  @IsNotEmpty()
  tenancyId: string;
}

export class CreateWhitelistResponse {
  id: string;
  registrationNumber: string;
  email: string;
  comments: string;
}

export class UpdateWhitelistRequest extends CreateWhitelistRequest {}

export class UpdateWhitelistResponse extends CreateWhitelistResponse {}

export class FindWhitelistRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  dateTo?: Date;

  @IsOptional()
  @IsIn([WhitelistType.HOUR, WhitelistType.DATE, WhitelistType.PERMANENT])
  type?: WhitelistType;
}

export class FindWhitelistResponse {
  id: string;
  registrationNumber: string;
  email: string;
  startDate: Date;
  endDate: Date;
  type: WhitelistType;
  status: WhitelistStatus;
  createdAt: Date;
  subCarPark: {
    id: string;
    carParkName: string;
  };
  tenancy: {
    id: string;
    tenancyName: string;
  };
}

export class GetAssignedSubCarParksResponse {
  subCarParkId: string;
  subCarParkName: string;
}
