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
  BulkDeleteWhitelistRequest,
  BulkDeleteWhitelistResponse,
  WhitelistDeleteResponse,
} from "./whitelist.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";

@ApiTags("Carpark Manager => Whitelist")
@Controller({ path: "carpark-manager/whitelist", version: "1" })
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.CARPARK_MANAGER)
  findAll(@Query() request: FindWhitelistRequest) {
    return this.whitelistService.findAll(request);
  }

  @Get("reports/csv")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.CARPARK_MANAGER)
  async exportCsv(
    @Query() request: FindWhitelistRequest,
    @Res() res: Response
  ) {
    const csvData = await this.whitelistService.exportToCsv(request);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="carpark-manager-whitelist-report.csv"'
    );
    res.send(csvData);
  }

  @Get(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.CARPARK_MANAGER)
  findOne(@Param("id") id: string) {
    return this.whitelistService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.CARPARK_MANAGER)
  create(@Body() request: CreateWhitelistRequest) {
    return this.whitelistService.create(request);
  }

  @Patch(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.CARPARK_MANAGER)
  update(@Param("id") id: string, @Body() request: UpdateWhitelistRequest) {
    return this.whitelistService.update(id, request);
  }

  @Patch("checkout/:id")
  @AllowedRoles(UserType.CARPARK_MANAGER)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  checkout(@Param("id") id: string): Promise<void> {
    return this.whitelistService.checkout(id);
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.CARPARK_MANAGER)
  bulkRemove(
    @Body() request: BulkDeleteWhitelistRequest
  ): Promise<BulkDeleteWhitelistResponse> {
    return this.whitelistService.bulkRemove(request.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.CARPARK_MANAGER)
  remove(@Param("id") id: string): Promise<WhitelistDeleteResponse> {
    return this.whitelistService.remove(id);
  }
}
