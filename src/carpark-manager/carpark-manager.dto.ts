import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { CarparkManagerStatus } from '../common/enums';

export class CreateCarparkManagerRequest {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  managerCode: string;

  @IsOptional()
  subCarParks?: SubCarParkRequest[];

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  specializations?: string;

  @IsOptional()
  @IsString()
  certifications?: string;
}

export class SubCarParkRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class UpdateCarparkManagerRequest extends PartialType(CreateCarparkManagerRequest) { }

export interface GetCarparkManagerResponse {
  id: string;
  userId: string;
  managerCode: string;
  subCarParks?: string[];
  yearsOfExperience?: number;
  specializations?: string;
  certifications?: string;
  createdAt: Date;
  updatedAt: Date;
}
