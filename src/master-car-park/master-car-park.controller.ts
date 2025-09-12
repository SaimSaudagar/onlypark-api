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
  UpdateMasterCarParkStatusRequest,
  UpdateMasterCarParkResponse,
  FindMasterCarParkByIdResponse,
  UpdateMasterCarParkStatusResponse,
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
  findById(@Param('id') id: string): Promise<FindMasterCarParkByIdResponse> {
    return this.masterCarParkService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() request: CreateMasterCarParkRequest): Promise<CreateMasterCarParkResponse> {
    return this.masterCarParkService.create(request);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() request: UpdateMasterCarParkRequest,
  ): Promise<UpdateMasterCarParkResponse> {
    return this.masterCarParkService.update(id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.masterCarParkService.remove(id);
  }

  @Patch('update-status/:id')
  updateStatus(@Param('id') id: string, @Query() request: UpdateMasterCarParkStatusRequest): Promise<UpdateMasterCarParkStatusResponse> {
    return this.masterCarParkService.updateStatus(id, request);
  }
}
