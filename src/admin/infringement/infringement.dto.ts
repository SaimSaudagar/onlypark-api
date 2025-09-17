import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';
import { InfringementStatus } from '../../common/enums';
import { ApiGetBaseRequest } from '../../common';

export class ScanInfringementRequest {
  @IsNotEmpty()
  @IsString()
  registrationNo: string;
}

export class ScanInfringementResponse {
  id: string;
  ticketNumber: number;
  registrationNo: string;
}

export class CreateInfringementRequest {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsUUID()
  infringementCarParkId: string;

  @IsOptional()
  @IsString()
  carMakeId?: string;

  @IsNotEmpty()
  @IsString()
  reasonId: string;

  @IsNotEmpty()
  @IsString()
  penaltyId: string;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsString()
  comments?: string;
}

export class CreateInfringementResponse {
  id: string;
  ticketNumber: number;
  registrationNo: string;
}

export class UpdateInfringementRequest extends PartialType(CreateInfringementRequest) { }

export interface GetInfringementResponse {
  ticketNumber: string;
  ticketDate: string;
  ticketTime: string;
  carPark: string;
  regNo: string;
  carMakeID?: string;
  status?: InfringementStatus;
  reasonId?: string;
  penaltyId?: string;
  photos?: string[];
  amount?: number;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MarkAsWaivedResponse {
  id: string;
  status: InfringementStatus;
}

export class GetTicketNumberRequest {
  @IsNotEmpty()
  @IsNumber()
  ticketNumber: number;

  @IsNotEmpty()
  @IsString()
  registrationNo: string;
}

export class FindInfringementRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: InfringementStatus;
}

export class FindInfringementResponse {
  id: string;
  ticketNumber: number;
  registrationNo: string;
  status: InfringementStatus;
  ticketDate: Date;
}

export class FindInfringementByIdResponse {
  id: string;
  ticketNumber: number;
  registrationNo: string;
  status: InfringementStatus;
  ticketDate: Date;
}

export class GetPenaltyResponse {
  id: string;
  penaltyName: string;
  amountBeforeDue: number;
  amountAfterDue: number;
}

export class UpdateInfringementStatusRequest {
  @IsNotEmpty()
  @IsString()
  status: InfringementStatus;
}

export class UpdateInfringementStatusResponse {
  id: string;
  status: InfringementStatus;
}