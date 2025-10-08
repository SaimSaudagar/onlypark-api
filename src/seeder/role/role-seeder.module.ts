import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../../role/entities/role.entity";
import { RoleSeederService } from "./role-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleSeederService],
  exports: [RoleSeederService],
})
export class RoleSeederModule {}
