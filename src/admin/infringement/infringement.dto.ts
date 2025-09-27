import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';
import { InfringementStatus } from '../../common/enums';
import { ApiGetBaseRequest } from '../../common';

export class ScanInfringementRequest {
  @IsNotEmpty()
  @IsString()
  registrationNumber: string;
}

export class ScanInfringementResponse {
  id: string;
  ticketNumber: number;
  registrationNumber: string;
}

export class CreateInfringementRequest {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsUUID()
  infringementCarParkId: string;

  @IsOptional()
  @IsUUID()
  carMakeId?: string;

  @IsNotEmpty()
  @IsUUID()
  reasonId: string;

  @IsNotEmpty()
  @IsUUID()
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
  registrationNumber: string;
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
  registrationNumber: string;
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
  registrationNumber: string;
  status: InfringementStatus;
  ticketDate: Date;
}

export class FindInfringementByIdResponse {
  id: string;
  ticketNumber: number;
  registrationNumber: string;
  status: InfringementStatus;
  ticketDate: Date;
  infringementCarParkId: string;
  reasonId: string;
  penaltyId: string;
  carMakeId: string;
  photos: string[];
  comments: string;
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

export class GetTicketResponse {
  id: string;
  ticketNumber: number;
  ticketDate: Date;
  registrationNumber: string;
  status: InfringementStatus;
  dueDate: Date;
  comments: string;
  photos: object;
  carMakeName: string;
  carParkName: string;
  reasonName: string;
  penaltyName: string;
  amountBeforeDue: number;
  amountAfterDue: number;
}

export class GetTicketRequest {
  @IsNumber()
  @IsNotEmpty()
  ticketNumber: number;
}

export class FindInfringementCarParkRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  search?: string;
}

export class InfringementCarParkResponse {
  id: string;
  carParkName: string;
}

export class FindInfringementReasonRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  search?: string;
}

export class InfringementReasonResponse {
  id: string;
  reason: string;
}