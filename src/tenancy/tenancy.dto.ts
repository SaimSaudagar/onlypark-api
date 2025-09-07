import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiGetBaseRequest } from "../common/types";

export class FindTenancyRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  tenantName?: string;

  @IsOptional()
  @IsEmail()
  tenantEmail?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class FindTenancyResponse {
  id: string;
  tenantName: string;
  tenantEmail: string;
  subCarParkId: string;
}

export class CreateTenancyResponse {
  id: string;
  tenantName: string;
  tenantEmail: string;
  subCarParkId: string;
}

export class CreateTenancyRequest {
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