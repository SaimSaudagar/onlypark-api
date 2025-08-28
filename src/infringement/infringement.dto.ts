import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';
import { InfringementStatus } from '../common/enums';

export class CreateInfringementRequest {
  @IsNotEmpty()
  @IsNumber()
  ticketNumber: number;

  @IsNotEmpty()
  @IsString()
  ticketDate: string;

  @IsNotEmpty()
  @IsString()
  ticketTime: string;

  @IsNotEmpty()
  @IsString()
  carSpotId: string;

  @IsNotEmpty()
  @IsString()
  regNo: string;

  @IsOptional()
  @IsString()
  carMake?: string;

  @IsOptional()
  @IsEnum(InfringementStatus)
  status?: InfringementStatus;

  @IsOptional()
  @IsString()
  reasonId?: string;

  @IsOptional()
  @IsString()
  penaltyId?: string;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class UpdateInfringementRequest extends PartialType(CreateInfringementRequest) {}

export interface GetInfringementResponse {
  ticketNumber: string;
  ticketDate: string;
  ticketTime: string;
  carSpotId: string;
  regNo: string;
  carMake?: string;
  status?: InfringementStatus;
  reasonId?: string;
  penaltyId?: string;
  photos?: string[];
  amount?: number;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}
