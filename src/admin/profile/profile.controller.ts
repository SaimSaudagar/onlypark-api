import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { ApiTags, ApiConsumes } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProfileService } from "./profile.service";
import JwtAuthGuard from "../../auth/guards/jwt-auth.guard";
import { RoleGuard, AllowedRoles } from "../../auth/guards/roles.guard";
import { RequirePermissions } from "../../common/decorators/permission.decorator";
import { PermissionsGuard } from "../../common/guards/permission.guard";
import { UserType, AdminPermission } from "../../common/enums";
import { CreateProfileDto, UpdateProfileDto } from "./profile.dto";

@ApiTags("Admin => Profile")
@Controller({ path: "admin/profile", version: "1" })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_CREATE)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  create(
    @Body() createProfileDto: CreateProfileDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.profileService.create(createProfileDto, image);
  }

  @Get()
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_LIST)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  findAll() {
    return this.profileService.findAll();
  }

  @Get(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_VIEW)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  findOne(@Param("id") id: string) {
    return this.profileService.findOne(id);
  }

  @Patch(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_EDIT)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  update(
    @Param("id") id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.profileService.update(id, updateProfileDto, image);
  }

  @Delete(":id")
  @AllowedRoles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @RequirePermissions(AdminPermission.USER_EDIT)
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  remove(@Param("id") id: string) {
    return this.profileService.remove(id);
  }
}
