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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../common/decorators';
import { ApiGetBaseResponse, AuthenticatedUser } from '../common';
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission, CarparkManagerPermission } from '../common/enums';
import { SubCarParkService } from './sub-car-park.service';
import {
  CreateSubCarParkRequest,
  UpdateSubCarParkRequest,
  FindSubCarParkResponse,
  SubCarParkAvailabilityResponse,
  QrCodeResponse,
  SubCarParkCreateResponse,
  SubCarParkUpdateResponse,
  SubCarParkDeleteResponse,
  SubCarParkRequest,
} from './sub-car-park.dto';

@ApiTags('SubCarPark')
@Controller({ path: 'sub-car-park', version: '1' })
export class SubCarParkController {
  constructor(private readonly subCarParkService: SubCarParkService) { }

  @Get()
  findAll(@Query() request: SubCarParkRequest): Promise<ApiGetBaseResponse<FindSubCarParkResponse>> {
    return this.subCarParkService.findAll(request);
  }

  @Get('master/:masterCarParkId')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  findByMasterCarPark(@Param('masterCarParkId') masterCarParkId: string): Promise<FindSubCarParkResponse[]> {
    return this.subCarParkService.findByMasterCarPark(masterCarParkId);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  findOne(@Param('id') id: string): Promise<FindSubCarParkResponse> {
    return this.subCarParkService.findOne({ where: { id } });
  }

  @Get(':id/qr-code')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  async getQrCode(@Param('id') id: string): Promise<QrCodeResponse> {
    return await this.subCarParkService.generateQrCode(id);
  }

  @Get(':id/availability')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_VIEW, CarparkManagerPermission.CAR_PARK_VIEW)
  async getAvailability(@Param('id') id: string): Promise<SubCarParkAvailabilityResponse> {
    return await this.subCarParkService.getAvailability(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSubCarParkDto: CreateSubCarParkRequest): Promise<SubCarParkCreateResponse> {
    return this.subCarParkService.create(createSubCarParkDto);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_EDIT, CarparkManagerPermission.CAR_PARK_EDIT)
  update(
    @Param('id') id: string,
    @Body() request: UpdateSubCarParkRequest,
  ): Promise<SubCarParkUpdateResponse> {
    return this.subCarParkService.create(request, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_DELETE, CarparkManagerPermission.CAR_PARK_DELETE)
  remove(@Param('id') id: string): Promise<SubCarParkDeleteResponse> {
    return this.subCarParkService.remove(id);
  }
}
