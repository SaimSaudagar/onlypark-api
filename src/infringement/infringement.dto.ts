import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsArray, isNotEmpty } from 'class-validator';
import { InfringementStatus } from '../common/enums';

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
  @IsString()
  carParkName: string;

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