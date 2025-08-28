import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
