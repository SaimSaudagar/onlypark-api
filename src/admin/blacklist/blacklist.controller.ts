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
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BlacklistService } from "./blacklist.service";
import {
  CreateBlacklistRequest,
  FindBlacklistRequest,
  UpdateBlacklistRequest,
} from "./blacklist.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";

@ApiTags("Admin => Blacklist")
@Controller({ path: "admin/blacklist", version: "1" })
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Get()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findAll(@Query() request: FindBlacklistRequest) {
    return this.blacklistService.findAll(request);
  }

  @Get(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findOne(@Param("id") id: string) {
    return this.blacklistService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  create(@Body() request: CreateBlacklistRequest) {
    return this.blacklistService.create(request);
  }

  @Patch(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  update(@Param("id") id: string, @Body() request: UpdateBlacklistRequest) {
    return this.blacklistService.update(id, request);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  remove(@Param("id") id: string) {
    return this.blacklistService.remove(id);
  }
}
