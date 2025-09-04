import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { RoleGuard, AllowedRoles } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission } from '../common/enums';
import { CreateAdminDto, UpdateAdminDto, AdminResponseDto } from './dto/admin.dto';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post()
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_CREATE)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_LIST)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_VIEW)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_EDIT)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @AllowedRoles(UserType.ADMIN)
  @RequirePermissions(AdminPermission.USER_EDIT)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
