import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsDate,
  IsArray,
  ArrayNotEmpty,
} from "class-validator";
import { ApiGetBaseRequest } from "../../common";

export class CreateBlacklistRequest {
  @IsUUID()
  @IsNotEmpty()
  subCarParkId: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
export class CreateBlacklistResponse {
  id: string;
  registrationNumber: string;
  email: string;
  comments: string;
}

export class UpdateBlacklistRequest extends CreateBlacklistRequest {}

export class UpdateBlacklistResponse extends CreateBlacklistResponse {}

export class FindBlacklistRequest extends ApiGetBaseRequest {
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
  @IsUUID(4)
  subCarParkId?: string;
}

export class FindBlacklistResponse {
  id: string;
  registrationNumber: string;
  email: string;
  createdAt: Date;
  subCarPark: {
    id: string;
    subCarParkName: string;
  };
}

export class BulkDeleteBlacklistRequest {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true })
  ids: string[];
}

export class BlacklistDeleteResponse {
  id: string;
  registrationNumber: string;
  email: string;
  message: string;
  deletedAt: Date;
}

export class FailedDeleteItem {
  id: string;
  reason: string;
}

export class BulkDeleteBlacklistResponse {
  deletedIds: string[];
  failedIds: FailedDeleteItem[];
  message: string;
  deletedAt: Date;
}
