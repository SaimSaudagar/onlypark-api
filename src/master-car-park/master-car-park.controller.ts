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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { UserType, AdminPermission, CarparkManagerPermission } from '../common/enums';
import { MasterCarParkService } from './master-car-park.service';
import {
  CreateMasterCarParkRequest,
  CreateMasterCarParkResponse,
  UpdateMasterCarParkRequest,
  FindMasterCarParkRequest,
} from './master-car-park.dto';

@ApiTags('MasterCarPark')
@Controller({ path: 'master-car-park', version: '1' })
export class MasterCarParkController {
  constructor(private readonly masterCarParkService: MasterCarParkService) { }

  @Get()
  findAll(@Query() request: FindMasterCarParkRequest) {
    return this.masterCarParkService.findAll(request);
  }

  @Get(':id')
  @RequirePermissions(AdminPermission.CAR_PARK_VIEW, CarparkManagerPermission.CAR_PARK_VIEW)
  findOne(@Param('id') id: string) {
    return this.masterCarParkService.findOne({ where: { id } });
  }

  @Get(':id/qr-code')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_VIEW, CarparkManagerPermission.CAR_PARK_VIEW)
  async getQrCode(@Param('id') id: string) {
    const qrCode = await this.masterCarParkService.generateQrCode(id);
    return { qrCode };
  }

  @Get(':id/statistics')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_VIEW, CarparkManagerPermission.CAR_PARK_VIEW)
  async getStatistics(@Param('id') id: string) {
    return await this.masterCarParkService.getStatistics(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMasterCarParkDto: CreateMasterCarParkRequest): Promise<CreateMasterCarParkResponse> {
    return this.masterCarParkService.create(createMasterCarParkDto);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.CAR_PARK_EDIT, CarparkManagerPermission.CAR_PARK_EDIT)
  update(
    @Param('id') id: string,
    @Body() updateMasterCarParkDto: UpdateMasterCarParkRequest,
  ) {
    return this.masterCarParkService.update(id, updateMasterCarParkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.masterCarParkService.remove(id);
  }
}
