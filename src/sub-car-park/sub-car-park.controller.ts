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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../common/decorators';
import { AuthenticatedUser } from '../common';
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
} from './dto/sub-car-park.dto';

@ApiTags('SubCarPark')
@JwtAuthGuardWithApiBearer()
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'sub-car-park', version: '1' })
export class SubCarParkController {
  constructor(private readonly subCarParkService: SubCarParkService) {}

  @Get()
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_LIST, CarparkManagerPermission.CAR_PARK_LIST)
  findAll() {
    return this.subCarParkService.findAll();
  }

  @Get('master/:masterCarParkId')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_LIST, CarparkManagerPermission.CAR_PARK_LIST)
  findByMasterCarPark(@Param('masterCarParkId') masterCarParkId: string) {
    return this.subCarParkService.findByMasterCarPark(masterCarParkId);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_VIEW, CarparkManagerPermission.CAR_PARK_VIEW)
  findOne(@Param('id') id: string) {
    return this.subCarParkService.findOne({ where: { id } });
  }

  @Get(':id/qr-code')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_VIEW, CarparkManagerPermission.CAR_PARK_VIEW)
  async getQrCode(@Param('id') id: string) {
    const qrCode = await this.subCarParkService.generateQrCode(id);
    return { qrCode };
  }

  @Get(':id/availability')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_VIEW, CarparkManagerPermission.CAR_PARK_VIEW)
  async getAvailability(@Param('id') id: string) {
    return await this.subCarParkService.getAvailability(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_CREATE, CarparkManagerPermission.CAR_PARK_CREATE)
  create(@Body() createSubCarParkDto: CreateSubCarParkRequest) {
    return this.subCarParkService.create(createSubCarParkDto);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_EDIT, CarparkManagerPermission.CAR_PARK_EDIT)
  update(
    @Param('id') id: string,
    @Body() updateSubCarParkDto: UpdateSubCarParkRequest,
  ) {
    return this.subCarParkService.update(id, updateSubCarParkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_DELETE, CarparkManagerPermission.CAR_PARK_DELETE)
  remove(@Param('id') id: string) {
    return this.subCarParkService.remove(id);
  }
}
