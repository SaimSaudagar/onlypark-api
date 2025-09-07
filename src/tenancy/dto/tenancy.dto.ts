import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class TenancyRequest {
  @IsNotEmpty()
  @IsString()
  tenantName: string;

  @IsNotEmpty()
  @IsEmail()
  tenantEmail: string;

  @IsNotEmpty()
  @IsUUID()
  subCarParkId: string;
}