import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Permission } from './entities/permission.entity';
import {
  CreatePermissionRequest,
  UpdatePermissionRequest,
  GetPermissionResponse,
} from './permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionRequest): Promise<GetPermissionResponse> {
    const permission = this.permissionRepository.create(createPermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);
    return {
      id: savedPermission.id,
      name: savedPermission.name,
      createdAt: savedPermission.createdAt,
      updatedAt: savedPermission.updatedAt,
    };
  }

  async findAll(options?: FindManyOptions<Permission>): Promise<GetPermissionResponse[]> {
    const permissions = await this.permissionRepository.find(options);
    return permissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }));
  }

  async findOne(options: FindOneOptions<Permission>): Promise<GetPermissionResponse> {
    const permission = await this.permissionRepository.findOne(options);
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }
    return {
      id: permission.id,
      name: permission.name,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }

  async findByPermissionName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionRequest): Promise<GetPermissionResponse> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }

    const updatedPermission = await this.permissionRepository.save({
      ...permission,
      ...updatePermissionDto,
    });

    return {
      id: updatedPermission.id,
      name: updatedPermission.name,
      createdAt: updatedPermission.createdAt,
      updatedAt: updatedPermission.updatedAt,
    };
  }

  async remove(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }
    await this.permissionRepository.delete(id);
  }
}