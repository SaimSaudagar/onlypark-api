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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../common/decorators';
import { AuthenticatedUser } from '../common';
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import {
  CreateUserRequest,
  UpdateNotificationTokenRequest,
  UpdateUserAddressRequest,
  UpdateUserDto,
  UpdateUserProfileRequest,
} from './user.dto';

@ApiTags('User')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ where: { id }, relations: ['addresses'] });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@User() user: AuthenticatedUser) {
    return this.userService.getProfile(user.id);
  }

  @Get('permissions')
  @HttpCode(HttpStatus.OK)
  async findAllPermissions(@User() user: AuthenticatedUser) {
    const permissions = await this.userService.findAllPermissions(user.id);
    return { permissions };
  }

  @Post()
  create(@Body() createUserDto: CreateUserRequest) {
    return this.userService.create(createUserDto);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(
    @Req() request: any,
    @Body() updateUserProfileDto: UpdateUserProfileRequest,
  ) {
    return this.userService.updateUserProfile(
      request.user,
      updateUserProfileDto,
    );
  }

  @Put('address')
  @HttpCode(HttpStatus.OK)
  async updateUserAddress(
    @Req() request: any,
    @Body() updateUserAddressDTO: UpdateUserAddressRequest,
  ) {
    return this.userService.updateUserAddress(
      request.user,
      updateUserAddressDTO,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('notification-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNotificationToken(
    @User() loggedInUser: AuthenticatedUser,
    @Body() request: UpdateNotificationTokenRequest,
  ) {
    await this.userService.updateNotificationToken(request, loggedInUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
