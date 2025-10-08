import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller({ path: "admin/user", version: "1" })
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  // @UseGuards(JwtAuthenticationGuard, PermissionsGuard)
  // findAll(request: FindUsersRequest): Promise<FindUsersResponse> {
  //   return this.userService.findAll(request);
  // }

  // @Get(':id')
  // @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  // @UseGuards(JwtAuthenticationGuard, PermissionsGuard)
  // findById(@Param('id') id: string) {
  //   return this.userService.findById(id);
  // }

  // @Post()
  // @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  // @UseGuards(JwtAuthenticationGuard, PermissionsGuard)
  // async create(@Body() request: CreateUserRequest): Promise<CreateUserResponse> {
  //   return this.userService.create(request);
  // }

  // @Patch(':id')
  // @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  // @UseGuards(JwtAuthenticationGuard, PermissionsGuard)
  // update(@Param('id') id: string, @Body() request: UpdateUserDto) {
  //   return this.userService.update(id, request);
  // }

  // @Delete(':id')
  // @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  // @UseGuards(JwtAuthenticationGuard, PermissionsGuard)
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(id);
  // }
}
