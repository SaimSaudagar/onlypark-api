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
import { VisitorService } from "./visitor.service";
import {
  CreateVisitorRequest,
  FindVisitorRequest,
  UpdateVisitorRequest,
  BulkDeleteVisitorRequest,
  BulkDeleteVisitorResponse,
  VisitorDeleteResponse,
} from "./visitor.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { AllowedRoles } from "../../auth/guards/roles.guard";
import { UserType } from "../../common/enums";
import { RoleGuard } from "../../auth/guards/roles.guard";

@ApiTags("Patrol Officer => Visitor")
@Controller({ path: "patrol-officer/visitor", version: "1" })
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  findAll(@Query() request: FindVisitorRequest) {
    return this.visitorService.findAll(request);
  }

  @Get("reports/csv")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  async exportCsv(@Query() request: FindVisitorRequest, @Res() res: Response) {
    const csvData = await this.visitorService.exportToCsv(request);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="patrol-officer-visitor-report.csv"'
    );
    res.send(csvData);
  }

  @Get("assigned-sub-car-parks")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  getAssignedSubCarParks() {
    return this.visitorService.getAssignedSubCarParks();
  }

  @Get(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  findOne(@Param("id") id: string) {
    return this.visitorService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  create(@Body() request: CreateVisitorRequest) {
    return this.visitorService.create(request);
  }

  @Patch(":id")
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  update(@Param("id") id: string, @Body() request: UpdateVisitorRequest) {
    return this.visitorService.update(id, request);
  }

  @Patch("checkout/:id")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  checkout(@Param("id") id: string): Promise<void> {
    return this.visitorService.checkout(id);
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  bulkRemove(
    @Body() request: BulkDeleteVisitorRequest
  ): Promise<BulkDeleteVisitorResponse> {
    return this.visitorService.bulkRemove(request.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @AllowedRoles(UserType.PATROL_OFFICER)
  remove(@Param("id") id: string): Promise<VisitorDeleteResponse> {
    return this.visitorService.remove(id);
  }
}
