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
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission, UserPermission, CarparkManagerPermission, PatrolOfficerPermission } from '../common/enums';
import { InfringementService } from './infringement.service';
import {
  CreateInfringementRequest,
  UpdateInfringementRequest,
  ScanInfringementRequest,
  FindInfringementRequest,
} from './infringement.dto';

@ApiTags('Infringement')
@JwtAuthGuardWithApiBearer()
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'infringement', version: '1' })
export class InfringementController {
  constructor(private readonly infringementService: InfringementService) { }

  @Get()
  findAll(@Query() request: FindInfringementRequest) {
    return this.infringementService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.infringementService.findById(id);
  }

  @Post('scan')
  @HttpCode(HttpStatus.CREATED)
  scan(@Body() request: ScanInfringementRequest) {
    return this.infringementService.scan(request);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() request: CreateInfringementRequest) {
    return this.infringementService.create(request);
  }

  @Patch('update')
  update(@Body() request: UpdateInfringementRequest) {
    return this.infringementService.create(request);
  }

  @Patch('mark-as-waived/:id')
  markAsWaived(@Param('id') id: string) {
    return this.infringementService.markAsWaived(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.infringementService.remove(id);
  }

  @Get('penalty/:carParkName')
  getPenalty(@Param('carParkName') carParkName: string) {
    return this.infringementService.getPenalty(carParkName);
  }
}
