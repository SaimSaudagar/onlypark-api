import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "../../permission/entities/permission.entity";
import { PermissionSeederService } from "./permission-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionSeederService],
  exports: [PermissionSeederService],
})
export class PermissionSeederModule {}
