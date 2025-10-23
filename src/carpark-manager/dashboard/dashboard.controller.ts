import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CarparkManagerDashboardService } from "./dashboard.service";
import {
  CarparkManagerDashboardRequest,
  CarparkManagerDashboardResponse,
} from "./dashboard.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";

@ApiTags("Carpark Manager => Dashboard")
@Controller({ path: "carpark-manager/dashboard", version: "1" })
export class CarparkManagerDashboardController {
  constructor(
    private readonly dashboardService: CarparkManagerDashboardService
  ) {}

  @Get()
  @AllowedRoles(UserType.CARPARK_MANAGER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  async getDashboardData(
    @Query() request: CarparkManagerDashboardRequest,
    @Request() req: any
  ): Promise<CarparkManagerDashboardResponse> {
    // Extract carpark manager ID from the authenticated user
    const carparkManagerId = req.user.carparkManagerId;
    return this.dashboardService.getDashboardData(request, carparkManagerId);
  }
}
