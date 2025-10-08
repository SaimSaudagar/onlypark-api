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

@ApiTags("Patrol Officer => Blacklist")
@Controller({ path: "patrol-officer/blacklist", version: "1" })
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  findAll(@Query() request: FindBlacklistRequest) {
    return this.blacklistService.findAll(request);
  }

  @Get("assigned-sub-car-parks")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  getAssignedSubCarParks() {
    return this.blacklistService.getAssignedSubCarParks();
  }

  @Get(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  findOne(@Param("id") id: string) {
    return this.blacklistService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  create(@Body() request: CreateBlacklistRequest) {
    return this.blacklistService.create(request);
  }

  @Patch(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  update(@Param("id") id: string, @Body() request: UpdateBlacklistRequest) {
    return this.blacklistService.update(id, request);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  remove(@Param("id") id: string) {
    return this.blacklistService.remove(id);
  }
}
