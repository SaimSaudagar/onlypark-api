import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UseGuards,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { WhitelistService } from "./whitelist.service";
import {
  CreateWhitelistRequest,
  FindWhitelistRequest,
  UpdateWhitelistRequest,
} from "./whitelist.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";

@ApiTags("Patrol Officer => Whitelist")
@Controller({ path: "patrol-officer/whitelist", version: "1" })
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  findAll(@Query() request: FindWhitelistRequest) {
    return this.whitelistService.findAll(request);
  }

  @Get("reports/csv")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  async exportCsv(
    @Query() request: FindWhitelistRequest,
    @Res() res: Response
  ) {
    const csvData = await this.whitelistService.exportToCsv(request);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="patrol-officer-whitelist-report.csv"'
    );
    res.send(csvData);
  }

  @Get("assigned-sub-car-parks")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  getAssignedSubCarParks() {
    return this.whitelistService.getAssignedSubCarParks();
  }

  @Get(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  findOne(@Param("id") id: string) {
    return this.whitelistService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  create(@Body() request: CreateWhitelistRequest) {
    return this.whitelistService.create(request);
  }

  @Patch(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  update(@Param("id") id: string, @Body() request: UpdateWhitelistRequest) {
    return this.whitelistService.update(id, request);
  }

  @Patch("checkout/:id")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  checkout(@Param("id") id: string): Promise<void> {
    return this.whitelistService.checkout(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  remove(@Param("id") id: string) {
    return this.whitelistService.remove(id);
  }
}
