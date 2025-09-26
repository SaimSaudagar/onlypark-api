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
  UseGuards,
  Query,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AllowedRoles, RoleGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RequirePermissions } from "../../common/decorators/permission.decorator";
import { PermissionsGuard } from "../../common/guards/permission.guard";
import { UserType } from "../../common/enums";
import { InfringementService } from "./infringement.service";
import {
  CreateInfringementRequest,
  UpdateInfringementRequest,
  UpdateInfringementStatusRequest,
  ScanInfringementRequest,
  FindInfringementRequest,
  GetTicketResponse,
  GetTicketRequest,
  FindInfringementCarParkRequest,
  FindInfringementReasonRequest,
} from "./infringement.dto";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";

@ApiTags("Admin => Infringement")
@Controller({ path: "admin/infringement", version: "1" })
export class InfringementController {
  constructor(private readonly infringementService: InfringementService) {}

  @Get()
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findAll(@Query() request: FindInfringementRequest) {
    return this.infringementService.findAll(request);
  }

  @Get("infringement-car-park")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  getInfringementCarPark(@Query() request: FindInfringementCarParkRequest) {
    return this.infringementService.findAllInfringementCarPark(request);
  }

  @Get("infringement-reason")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  getInfringementReason(@Query() request: FindInfringementReasonRequest) {
    return this.infringementService.findAllInfringementReason(request);
  }

  @Get("ticket")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  getTicket(@Query() request: GetTicketRequest): Promise<GetTicketResponse> {
    return this.infringementService.getTicket(request);
  }

  @Get(":id")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findOne(@Param("id") id: string) {
    return this.infringementService.findById(id);
  }

  @Post("scan")
  @HttpCode(HttpStatus.CREATED)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  scan(@Body() request: ScanInfringementRequest) {
    return this.infringementService.scan(request);
  }

  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  create(@Body() request: CreateInfringementRequest) {
    return this.infringementService.create(request);
  }

  @Patch("update/:id")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  update(@Param("id") id: string, @Body() request: UpdateInfringementRequest) {
    return this.infringementService.update(id, request);
  }

  @Patch("mark-as-waived/:id")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  markAsWaived(@Param("id") id: string) {
    return this.infringementService.markAsWaived(id);
  }

  @Patch("update-status/:id")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  updateStatus(
    @Param("id") id: string,
    @Body() request: UpdateInfringementStatusRequest
  ) {
    return this.infringementService.updateStatus(id, request);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  remove(@Param("id") id: string) {
    return this.infringementService.remove(id);
  }

  @Get("penalty/:infringementCarParkId")
  @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  getPenalty(@Param("infringementCarParkId") infringementCarParkId: string) {
    return this.infringementService.getPenalty(infringementCarParkId);
  }

  @Get("ticket/:ticketNumber/png")
  async getTicketPng(
    @Param("ticketNumber") ticketNumber: number,
    @Res() res: Response
  ): Promise<void> {
    const pngBuffer =
      await this.infringementService.generateTicketPng(ticketNumber);

    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": "inline; filename=ticket.png",
      "Content-Length": pngBuffer.length.toString(),
    });

    res.send(pngBuffer);
  }
}
