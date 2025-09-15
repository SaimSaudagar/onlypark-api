import { IsString, IsOptional, IsUUID, IsNotEmpty, IsDate, IsEnum } from 'class-validator';
import { ApiGetBaseRequest, BlacklistStatus } from '../common';

export class CreateBlacklistRequest {
  @IsUUID()
  @IsNotEmpty()
  subCarParkId: string;

  @IsString()
  @IsNotEmpty()
  regNo: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
export class CreateBlacklistResponse {
  id: string;
  regNo: string;
  email: string;
  comments: string;
}

export class UpdateBlacklistRequest extends CreateBlacklistRequest { }

export class UpdateBlacklistResponse extends CreateBlacklistResponse { }

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
}

export class FindBlacklistResponse {
  id: string;
  regNo: string;
  email: string;
  createdAt: Date;
  subCarPark: {
    id: string;
    subCarParkName: string;
  };
}