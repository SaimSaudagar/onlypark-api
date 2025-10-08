import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OptionalJwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SubCarParkService } from "./sub-car-park.service";
import { GetSubCarParkByCodeResponse } from "./sub-car-park.dto";

@ApiTags("SubCarPark")
@Controller({ path: "sub-car-park", version: "1" })
export class SubCarParkController {
  constructor(private readonly subCarParkService: SubCarParkService) {}

  @Get(":subCarParkCode")
  @UseGuards(OptionalJwtAuthGuard)
  async getBySubCarParkCode(
    @Param("subCarParkCode") subCarParkCode: string,
  ): Promise<GetSubCarParkByCodeResponse> {
    return this.subCarParkService.getBySubCarParkCode(subCarParkCode);
  }
}
