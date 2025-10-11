import { DisputeStatus } from "../common/enums";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsEmail,
  IsOptional,
} from "class-validator";

export class CreateDisputeResponse {
  id: string;
  infringementId: string;
  registrationNumber: string;
  status: DisputeStatus;
  firstName: string;
  lastName: string;
  companyName: string;
  address: string;
  state: string;
  zipCode: string;
  mobileNumber: string;
  email: string;
  carMakeId: string;
  model: string;
  appeal: string;
  photos: string[];
  ticketNumber: number;
}

export class CreateDisputeRequest {
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsNumber()
  @IsNotEmpty()
  ticketNumber: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  carMakeId: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  appeal: string;

  @IsOptional()
  @IsString()
  photos?: string;
}
