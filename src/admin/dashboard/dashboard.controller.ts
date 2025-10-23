import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { DashboardRequest, DashboardResponse } from "./dashboard.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";

@ApiTags("Admin => Dashboard")
@Controller({ path: "admin/dashboard", version: "1" })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  async getDashboardData(
    @Query() request: DashboardRequest
  ): Promise<DashboardResponse> {
    return this.dashboardService.getDashboardData(request);
  }
}
