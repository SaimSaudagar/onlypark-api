import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { RolePermission } from '../../role/entities/role-permission.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class RolePermissionSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('Starting Role-Permission Data seed');
    const rolePermissions = FileUtils.getDataForSeeding('role-permissions');

    for (const rolePermissionData of rolePermissions) {
      const role = await this.roleRepository.findOne({
        where: { name: rolePermissionData.role },
      });

      if (!role) {
        this.logger.warn(`Role ${rolePermissionData.role} not found`);
        continue;
      }

      const permissions = await this.permissionRepository.find({
        where: { name: In(rolePermissionData.permissions) },
      });

      if (permissions.length === 0) {
        this.logger.warn(`No permissions found for role ${rolePermissionData.role}`);
        continue;
      }

      // Clear existing permissions and assign new ones
      await this.rolePermissionRepository.delete({ rolesId: role.id });
      
      const rolePermissions = permissions.map(permission => {
        const rolePermission = new RolePermission();
        rolePermission.rolesId = role.id;
        rolePermission.permissionsId = permission.id;
        return rolePermission;
      });
      
      await this.rolePermissionRepository.save(rolePermissions);

      this.logger.log(
        `Assigned ${permissions.length} permissions to role ${rolePermissionData.role}`,
      );
    }
  }
}
