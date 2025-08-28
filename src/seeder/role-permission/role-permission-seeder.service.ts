import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class RolePermissionSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
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
        relations: ['permissions'],
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
      role.permissions = permissions;
      await this.roleRepository.save(role);

      this.logger.log(
        `Assigned ${permissions.length} permissions to role ${rolePermissionData.role}`,
      );
    }
  }
}
