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
} from './infringement.dto';

@ApiTags('Infringement')
@JwtAuthGuardWithApiBearer()
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'infringement', version: '1' })
export class InfringementController {
  constructor(private readonly infringementService: InfringementService) { }

  @Get()
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  @RequirePermissions(AdminPermission.INFRINGEMENT_LIST, CarparkManagerPermission.INFRINGEMENT_LIST, UserPermission.INFRINGEMENT_LIST, PatrolOfficerPermission.INFRINGEMENT_LIST)
  findAll() {
    return this.infringementService.findAll();
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  @RequirePermissions(AdminPermission.INFRINGEMENT_VIEW, CarparkManagerPermission.INFRINGEMENT_VIEW, UserPermission.INFRINGEMENT_VIEW, PatrolOfficerPermission.INFRINGEMENT_VIEW)
  findOne(@Param('id') id: string) {
    return this.infringementService.findOne(id);
  }

  @Post('scan')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  @RequirePermissions(AdminPermission.INFRINGEMENT_CREATE, CarparkManagerPermission.INFRINGEMENT_CREATE, PatrolOfficerPermission.INFRINGEMENT_CREATE)
  scan(@Body() request: ScanInfringementRequest) {
    return this.infringementService.scan(request);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  @RequirePermissions(AdminPermission.INFRINGEMENT_CREATE, CarparkManagerPermission.INFRINGEMENT_CREATE, PatrolOfficerPermission.INFRINGEMENT_CREATE)
  create(@Body() request: CreateInfringementRequest) {
    return this.infringementService.create(request);
  }

  @Patch('update')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  @RequirePermissions(AdminPermission.INFRINGEMENT_EDIT, CarparkManagerPermission.INFRINGEMENT_EDIT, PatrolOfficerPermission.INFRINGEMENT_EDIT)
  update(@Body() request: UpdateInfringementRequest) {
    return this.infringementService.create(request);
  }

  @Patch('mark-as-waived/:id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  @RequirePermissions(AdminPermission.INFRINGEMENT_EDIT, CarparkManagerPermission.INFRINGEMENT_EDIT, PatrolOfficerPermission.INFRINGEMENT_EDIT)
  markAsWaived(@Param('id') id: string) {
    return this.infringementService.markAsWaived(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.INFRINGEMENT_DELETE, CarparkManagerPermission.INFRINGEMENT_DELETE)
  remove(@Param('id') id: string) {
    return this.infringementService.remove(id);
  }
}
