import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { RoleGuard, AllowedRoles } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission } from '../common/enums';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create admin' })
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_CREATE)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  create(@Body() createAdminDto: any) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_LIST)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_VIEW)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin' })
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_EDIT)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  update(@Param('id') id: string, @Body() updateAdminDto: any) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin' })
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_DELETE)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
