import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum } from "class-validator";
import { CarParkType, ParkingSpotStatus } from "../../common/enums";
import { ApiGetBaseRequest } from "../../common/types";

export class FindMasterCarParkRequest extends ApiGetBaseRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CarParkType)
  carParkType?: CarParkType;

  @ApiProperty({ required: false, enum: ParkingSpotStatus })
  @IsOptional()
  @IsEnum(ParkingSpotStatus)
  status?: ParkingSpotStatus;

  
}

export class FindMasterCarParkResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  carParkName: string;

  @ApiProperty()
  carParkType: string;

  @ApiProperty()
  carParkCode: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [Object] })
  subCarParks: {
    id: string;
    carParkName: string;
    carSpace: number;
    status: string;
  }[];
}
