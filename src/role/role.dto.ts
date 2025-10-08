import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString, IsArray, IsOptional } from "class-validator";

export class CreateRoleRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateRoleRequest extends PartialType(CreateRoleRequest) {}

export interface GetRoleResponse {
  id: string;
  name: string;
  permissions: {
    id: string;
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
