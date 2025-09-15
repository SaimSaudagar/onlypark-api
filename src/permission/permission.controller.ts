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
import { RoleGuard, AllowedRoles } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission } from '../common/enums';
import { PermissionService } from './permission.service';
import {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from './permission.dto';

@ApiTags('Permission')
@Controller({ path: 'permission', version: '1' })
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.PERMISSION_LIST)
  @UseGuards(RoleGuard, PermissionsGuard)
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.PERMISSION_VIEW)
  @UseGuards(RoleGuard, PermissionsGuard)
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.PERMISSION_CREATE)
  @UseGuards(RoleGuard, PermissionsGuard)
  create(@Body() createPermissionDto: CreatePermissionRequest) {
    return this.permissionService.create(createPermissionDto);
  }

  @Patch(':id')
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.PERMISSION_EDIT)
  @UseGuards(RoleGuard, PermissionsGuard)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionRequest) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.PERMISSION_DELETE)
  @UseGuards(RoleGuard, PermissionsGuard)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
