import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsEmail,
  IsArray,
  ArrayNotEmpty,
} from "class-validator";
import { ApiGetBaseRequest, VisitorBookingStatus } from "../../common";

export class CreateVisitorRequest {
  @IsUUID()
  @IsNotEmpty()
  subCarParkId: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUUID()
  @IsNotEmpty()
  tenancyId: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsOptional()
  @IsEnum(VisitorBookingStatus)
  status?: VisitorBookingStatus;
}

export class CreateVisitorResponse {
  id: string;
  registrationNumber: string;
  email: string;
  startDate: Date;
  endDate: Date;
  status: VisitorBookingStatus;
  token: string;
}

export class UpdateVisitorRequest extends CreateVisitorRequest {}

export class UpdateVisitorResponse extends CreateVisitorResponse {}

export class FindVisitorRequest extends ApiGetBaseRequest {
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
  @IsEnum(VisitorBookingStatus)
  status?: VisitorBookingStatus;

  @IsOptional()
  @IsUUID(4)
  subCarParkId?: string;
}

export class FindVisitorResponse {
  id: string;
  registrationNumber: string;
  email: string;
  startDate: Date;
  endDate: Date;
  status: VisitorBookingStatus;
  token: string;
  createdAt: Date;
  subCarPark: {
    id: string;
    carParkName: string;
  };
  tenancy: {
    id: string;
    tenantName: string;
  };
}

export class GetAssignedSubCarParksResponse {
  subCarParkId: string;
  subCarParkName: string;
}

export class BulkDeleteVisitorRequest {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true })
  ids: string[];
}

export class VisitorDeleteResponse {
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

export class BulkDeleteVisitorResponse {
  deletedIds: string[];
  failedIds: FailedDeleteItem[];
  message: string;
  deletedAt: Date;
}
