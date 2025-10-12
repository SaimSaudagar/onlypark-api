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
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { ApiTags, ApiConsumes } from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { AllowedRoles, RoleGuard } from "../../auth/guards/roles.guard";
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

@ApiTags("Patrol Officer => Infringement")
@Controller({ path: "patrol-officer/infringement", version: "1" })
export class InfringementController {
  constructor(private readonly infringementService: InfringementService) {}

  @Get()
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findAll(@Query() request: FindInfringementRequest) {
    return this.infringementService.findAll(request);
  }

  @Get("infringement-car-park")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  getInfringementCarPark(@Query() request: FindInfringementCarParkRequest) {
    return this.infringementService.findAllInfringementCarPark(request);
  }

  @Get("infringement-reason")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  getInfringementReason(@Query() request: FindInfringementReasonRequest) {
    return this.infringementService.findAllInfringementReason(request);
  }

  @Get("ticket")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  getTicket(@Query() request: GetTicketRequest): Promise<GetTicketResponse> {
    return this.infringementService.getTicket(request);
  }

  @Get(":id")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findOne(@Param("id") id: string) {
    return this.infringementService.findById(id);
  }

  @Post("scan")
  @HttpCode(HttpStatus.CREATED)
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  scan(@Body() request: ScanInfringementRequest) {
    return this.infringementService.scan(request);
  }

  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor("photos", 10)) // Allow up to 10 photos
  @ApiConsumes("multipart/form-data")
  create(
    @Body() request: CreateInfringementRequest,
    @UploadedFiles() photos?: Express.Multer.File[]
  ) {
    return this.infringementService.create(request, photos);
  }

  @Patch("update/:id")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor("photos", 10)) // Allow up to 10 photos
  @ApiConsumes("multipart/form-data")
  update(
    @Param("id") id: string,
    @Body() request: UpdateInfringementRequest,
    @UploadedFiles() photos?: Express.Multer.File[]
  ) {
    return this.infringementService.update(id, request, photos);
  }

  @Patch("mark-as-waived/:id")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  markAsWaived(@Param("id") id: string) {
    return this.infringementService.markAsWaived(id);
  }

  @Patch("update-status/:id")
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  updateStatus(
    @Param("id") id: string,
    @Body() request: UpdateInfringementStatusRequest
  ) {
    return this.infringementService.updateStatus(id, request);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @AllowedRoles(UserType.PATROL_OFFICER)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  remove(@Param("id") id: string) {
    return this.infringementService.remove(id);
  }

  @Get("penalty/:infringementCarParkId")
  @AllowedRoles(UserType.PATROL_OFFICER)
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
