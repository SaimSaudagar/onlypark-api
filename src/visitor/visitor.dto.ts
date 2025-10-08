import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVisitorBookingRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  registrationNumber: string;

  @IsNotEmpty()
  @IsUUID()
  subCarParkId: string;

  @IsOptional()
  @IsUUID()
  tenancyId?: string;
}

export class CreateVisitorBookingResponse {
  id: string;
  email: string;
  registrationNumber: string;
  subCarParkId: string;
  tenancyId?: string;
  startTime: string;
  endTime: string;
  status: string;
  token: string;
}

export class GetBookingByTokenResponse {
  id: string;
  email: string;
  registrationNumber: string;
  subCarParkId: string;
  tenancyId?: string;
  startTime: string;
  endTime: string;
  status: string;
  subCarPark?: {
    id: string;
    name: string;
    freeHours: number;
  };
  tenancy?: {
    id: string;
    name: string;
  };
}
