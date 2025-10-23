import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PatrolOfficerDashboardService } from "./dashboard.service";
import {
  PatrolOfficerDashboardRequest,
  PatrolOfficerDashboardResponse,
} from "./dashboard.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";

@ApiTags("Patrol Officer => Dashboard")
@Controller({ path: "patrol-officer/dashboard", version: "1" })
export class PatrolOfficerDashboardController {
  constructor(
    private readonly dashboardService: PatrolOfficerDashboardService
  ) {}

  @Get()
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  async getDashboardData(
    @Query() request: PatrolOfficerDashboardRequest,
    @Request() req: any
  ): Promise<PatrolOfficerDashboardResponse> {
    // Extract patrol officer ID from the authenticated user
    const patrolOfficerId = req.user.patrolOfficerId;
    return this.dashboardService.getDashboardData(request, patrolOfficerId);
  }
}
