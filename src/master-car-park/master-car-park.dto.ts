import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDecimal, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { CarParkType, ParkingSpotStatus } from '../common/enums';
import { ApiGetBaseRequest } from '../common/types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMasterCarParkRequest {
  @IsNotEmpty()
  @IsString()
  carParkName: string;

  @IsNotEmpty()
  @IsEnum(CarParkType)
  carParkType: CarParkType;
}

export class CreateMasterCarParkResponse {
  id: string;
  carParkName: string;
  carParkType: CarParkType;
  masterCarParkCode: string;
  status: ParkingSpotStatus;
}

export class UpdateMasterCarParkRequest extends CreateMasterCarParkRequest { }
export class UpdateMasterCarParkStatusRequest {
  @IsNotEmpty()
  @IsEnum(ParkingSpotStatus)
  status: ParkingSpotStatus;
}

export class UpdateMasterCarParkStatusResponse {
  id: string;
  status: ParkingSpotStatus;
}


export class UpdateMasterCarParkResponse extends CreateMasterCarParkResponse { }


export class FindMasterCarParkRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['carParkName'])
  sortField?: string;
}

export class FindMasterCarParkResponse {
  id: string;
  carParkName: string;
  carParkCode: string;
  carParkType: CarParkType;
  status: ParkingSpotStatus;
}

export class FindMasterCarParkByIdResponse extends FindMasterCarParkResponse {
  subCarParks?: SubCarParkResponse[];
}

export interface SubCarParkResponse {
  id: string;
  carParkName: string;
  carSpace: number;
  status: ParkingSpotStatus;
}
