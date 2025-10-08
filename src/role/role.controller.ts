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
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { User } from "../common/decorators";
import { AuthenticatedUser } from "../common";
import { RoleGuard, AllowedRoles } from "../auth/guards/roles.guard";
import { RequirePermissions } from "../common/decorators/permission.decorator";
import { PermissionsGuard } from "../common/guards/permission.guard";
import { UserType, AdminPermission } from "../common/enums";
import { RoleService } from "./role.service";
import { CreateRoleRequest, UpdateRoleRequest } from "./role.dto";

@ApiTags("Role")
@Controller({ path: "role", version: "1" })
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.ROLE_LIST)
  @UseGuards(RoleGuard, PermissionsGuard)
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.ROLE_VIEW)
  @UseGuards(RoleGuard, PermissionsGuard)
  findOne(@Param("id") id: string) {
    return this.roleService.findOne({
      where: { id },
      relations: ["permissions"],
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.ROLE_CREATE)
  @UseGuards(RoleGuard, PermissionsGuard)
  create(@Body() createRoleDto: CreateRoleRequest) {
    return this.roleService.create(createRoleDto);
  }

  @Patch(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.ROLE_EDIT)
  @UseGuards(RoleGuard, PermissionsGuard)
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleRequest) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.ROLE_DELETE)
  @UseGuards(RoleGuard, PermissionsGuard)
  remove(@Param("id") id: string) {
    return this.roleService.remove(id);
  }
}
