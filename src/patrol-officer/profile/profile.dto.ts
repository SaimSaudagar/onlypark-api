import { PartialType } from "@nestjs/mapped-types";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
} from "class-validator";

export class CreateProfileRequest {
  @IsNotEmpty()
  @IsString()
  userId: string;

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

export class UpdateProfileRequest extends PartialType(CreateProfileRequest) {}

export interface GetProfileResponse {
  id: string;
  userId: string;
  subCarParks?: string[];
  yearsOfExperience?: number;
  specializations?: string;
  certifications?: string;
  createdAt: Date;
  updatedAt: Date;
}
