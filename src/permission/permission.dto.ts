import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionRequest {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdatePermissionRequest extends PartialType(CreatePermissionRequest) {}

export interface GetPermissionResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
