import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  HttpCode,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../common/decorators';
import { AuthenticatedUser } from '../common';
import { RoleGuard, AllowedRoles } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission, UserPermission } from '../common/enums';
import { UserService } from './user.service';
import {
  CreateUserRequest,
  CreateUserResponse,
  UpdateNotificationTokenRequest,
  UpdateUserDto,
  UpdateUserProfileRequest,
} from './user.dto';

@ApiTags('User')
@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_LIST)
  @UseGuards(RoleGuard, PermissionsGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_VIEW)
  @UseGuards(RoleGuard, PermissionsGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ where: { id } });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(UserPermission.PROFILE_VIEW)
  async getProfile(@User() user: AuthenticatedUser) {
    return this.userService.getProfile(user.id);
  }

  @Get('permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(UserPermission.PROFILE_VIEW)
  async findAllPermissions(@User() user: AuthenticatedUser) {
    const permissions = await this.userService.findAllPermissions(user.id);
    return { permissions };
  }

  @Post()
  // @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  // @RequirePermissions(AdminPermission.USER_CREATE)
  // @UseGuards(RoleGuard, PermissionsGuard)
  async create(@Body() request: CreateUserRequest): Promise<CreateUserResponse> {
    return this.userService.create(request);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(UserPermission.PROFILE_EDIT)
  async updateUserProfile(
    @Req() request: any,
    @Body() updateUserProfileDto: UpdateUserProfileRequest,
  ) {
    return this.userService.updateUserProfile(
      request.user,
      updateUserProfileDto,
    );
  }

  @Patch(':id')
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_EDIT)
  @UseGuards(RoleGuard, PermissionsGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('notification-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(UserPermission.PROFILE_EDIT)
  async updateNotificationToken(
    @User() loggedInUser: AuthenticatedUser,
    @Body() request: UpdateNotificationTokenRequest,
  ) {
    await this.userService.updateNotificationToken(request, loggedInUser);
  }

  @Delete(':id')
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_DELETE)
  @UseGuards(RoleGuard, PermissionsGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
