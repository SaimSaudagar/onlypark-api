import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { WhitelistType } from "../common/enums";

export class CreateSelfServeWhitelistRequest {
  @IsNotEmpty()
  @IsString()
  registrationNumber: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsUUID()
  subCarParkId: string;

  @IsNotEmpty()
  @IsUUID()
  tenancyId: string;
}

export class CreateSelfServeWhitelistResponse {
  id: string;
  registrationNumber: string;
  comments: string;
  email: string;
  subCarParkId: string;
  tenancyId: string;
  whitelistType: WhitelistType;
  startDate: Date;
  endDate: Date;
  token: string;
}

export class GetWhitelistByTokenResponse {
  id: string;
  registrationNumber: string;
  comments: string;
  email: string;
  subCarParkId: string;
  tenancyId: string;
  whitelistType: WhitelistType;
  startDate: Date;
  endDate: Date;
  subCarPark: {
    id: string;
    name: string;
    code: string;
  };
  tenancy: {
    id: string;
    name: string;
    email: string;
  };
}
