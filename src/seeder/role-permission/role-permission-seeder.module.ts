import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../../role/entities/role.entity";
import { Permission } from "../../permission/entities/permission.entity";
import { RolePermission } from "../../role/entities/role-permission.entity";
import { RolePermissionSeederService } from "./role-permission-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  providers: [RolePermissionSeederService],
  exports: [RolePermissionSeederService],
})
export class RolePermissionSeederModule {}
