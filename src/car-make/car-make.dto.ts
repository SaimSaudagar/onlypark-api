import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCarMakeRequest {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateCarMakeRequest extends PartialType(CreateCarMakeRequest) {}

export interface GetCarMakeResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
