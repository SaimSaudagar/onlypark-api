import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import {
  CreateRoleRequest,
  UpdateRoleRequest,
} from './role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(roleDto: CreateRoleRequest): Promise<Role> {
    const { name, permissions } = roleDto;

    // check if the role exists in the db
    const roleInDb = await this.roleRepository.findOne({
      where: { name },
    });
    if (roleInDb) {
      throw new BadRequestException('Role already exists');
    }
    
    const role: Role = await this.roleRepository.create({
      name,
    });

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionEntities = await this.permissionRepository.findBy({
        id: In(permissions)
      });
      
      // Create role-permission relationships
      const rolePermissions = permissionEntities.map(permission => {
        const rolePermission = new RolePermission();
        rolePermission.rolesId = role.id;
        rolePermission.permissionsId = permission.id;
        return rolePermission;
      });
      
      await this.rolePermissionRepository.save(rolePermissions);
    }

    await this.roleRepository.save(role);
    return role;
  }

  async findAll(options?: FindManyOptions<Role>): Promise<Role[]> {
    return await this.roleRepository.find(options);
  }

  async findOne(options?: FindOneOptions<Role>): Promise<Role> {
    const role = await this.roleRepository.findOne(options);
    return role;
  }

  async findByRoleName(name: string) {
    return await this.roleRepository.findOne({
      where: { name },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleRequest) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  remove(id: string) {
    return `This action removes a #${id} role`;
  }
}