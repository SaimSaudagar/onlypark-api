import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { ApiGetBaseRequest } from "../common/types";

export class CreateWhitelistCompanyDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  domainName: string;

  @IsNotEmpty()
  @IsUUID()
  subCarParkId: string;
}

export class CreateWhitelistCompanyResponse {
  id: string;
  companyName: string;
  domainName: string;
  subCarParkId: string;
}

export class UpdateWhitelistCompanyDto extends PartialType(
  CreateWhitelistCompanyDto,
) {}

export class FindWhitelistCompanyRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  domainName?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class FindWhitelistCompanyResponse {
  id: string;
  companyName: string;
  domainName: string;
  subCarParkId: string;
}
