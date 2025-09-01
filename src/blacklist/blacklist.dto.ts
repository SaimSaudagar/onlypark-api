import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBlacklistDto {
  @IsString()
  regNo: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  subCarParkCode?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateBlacklistDto extends PartialType(CreateBlacklistDto) { }
