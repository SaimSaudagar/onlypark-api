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
  CreateWhitelistResponse,
  FindWhitelistRequest,
  FindWhitelistResponse,
  UpdateWhitelistRequest,
  BulkDeleteWhitelistRequest,
  BulkDeleteWhitelistResponse,
  WhitelistDeleteResponse,
} from "./whitelist.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";
import { ApiGetBaseResponse } from "../../common";

@ApiTags("Admin => Whitelist")
@Controller({ path: "admin/whitelist", version: "1" })
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  findAll(
    @Query() request: FindWhitelistRequest
  ): Promise<ApiGetBaseResponse<FindWhitelistResponse>> {
    return this.whitelistService.findAll(request);
  }

  @Get("reports/csv")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  async exportCsv(
    @Query() request: FindWhitelistRequest,
    @Res() res: Response
  ) {
    const csvData = await this.whitelistService.exportToCsv(request);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="admin-whitelist-report.csv"'
    );
    res.send(csvData);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  create(
    @Body() request: CreateWhitelistRequest
  ): Promise<CreateWhitelistResponse> {
    return this.whitelistService.create(request);
  }

  @Get(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  findOne(@Param("id") id: string) {
    return this.whitelistService.findOne({ where: { id } });
  }

  @Patch(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  update(@Param("id") id: string, @Body() request: UpdateWhitelistRequest) {
    return this.whitelistService.update(id, request);
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  bulkRemove(
    @Body() request: BulkDeleteWhitelistRequest
  ): Promise<BulkDeleteWhitelistResponse> {
    return this.whitelistService.bulkRemove(request.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  remove(@Param("id") id: string): Promise<WhitelistDeleteResponse> {
    return this.whitelistService.remove(id);
  }

  @Patch("checkout/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  checkout(@Param("id") id: string): Promise<void> {
    return this.whitelistService.checkout(id);
  }
}
