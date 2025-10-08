import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import JwtAuthenticationGuard from "../../auth/guards/jwt-auth.guard";
import { VisitorBookingService } from "./visitor.service";
import {
  VisitorBookingResponse,
  VisitorBookingDeleteResponse,
  FindVisitorBookingRequest,
  FindVisitorBookingResponse,
} from "./visitor.dto";
import {
  ApiGetBaseResponse,
  UserType,
  RoleGuard,
  AllowedRoles,
} from "../../common";

@ApiTags("Admin => Visitor")
@Controller({ path: "admin/visitor", version: "1" })
@UseGuards(JwtAuthenticationGuard)
export class VisitorBookingController {
  constructor(private readonly visitorBookingService: VisitorBookingService) {}

  @Get()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findAll(
    @Query() request: FindVisitorBookingRequest
  ): Promise<ApiGetBaseResponse<FindVisitorBookingResponse>> {
    return this.visitorBookingService.findAll(request);
  }

  @Get(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  findOne(@Param("id") id: string): Promise<VisitorBookingResponse | null> {
    return this.visitorBookingService.findOne({ where: { id } });
  }

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body() request: CreateVisitorBookingRequest): Promise<VisitorBookingCreateResponse> {
  //     return this.visitorBookingService.create(request);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDto: UpdateVisitorBookingRequest)
  // :Promise<VisitorBookingUpdateResponse>
  // {
  //     return this.visitorBookingService.update(id, updateDto);
  // }

  @Patch("checkout/:id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  checkout(@Param("id") id: string): Promise<void> {
    return this.visitorBookingService.checkout(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  remove(@Param("id") id: string): Promise<VisitorBookingDeleteResponse> {
    return this.visitorBookingService.remove(id);
  }
}
