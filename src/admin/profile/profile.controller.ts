import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import JwtAuthGuard from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, AllowedRoles } from '../../auth/guards/roles.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { UserType, AdminPermission } from '../../common/enums';
import { CreateProfileDto, UpdateProfileDto, ProfileResponseDto } from './profile.dto';

@ApiTags('Admin => Profile')
@Controller({ path: 'admin/profile', version: '1' })
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Post()
    @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.USER_CREATE)
    @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
    create(@Body() createProfileDto: CreateProfileDto) {
        return this.profileService.create(createProfileDto);
    }

    @Get()
    @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.USER_LIST)
    @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
    findAll() {
        return this.profileService.findAll();
    }

    @Get(':id')
    @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.USER_VIEW)
    @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
    findOne(@Param('id') id: string) {
        return this.profileService.findOne(id);
    }

    @Patch(':id')
    @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.USER_EDIT)
    @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
    update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
        return this.profileService.update(id, updateProfileDto);
    }

    @Delete(':id')
    @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.USER_EDIT)
    @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
    remove(@Param('id') id: string) {
        return this.profileService.remove(id);
    }
}
