import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class RoleSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('Starting Role Data seed');
    const roles = FileUtils.getDataForSeeding('roles');

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
        });

        await this.roleRepository.save(role);
        this.logger.log(`Role ${roleData.name} seeded`);
      } else {
        this.logger.log(`Role ${roleData.name} already exists`);
      }
    }
  }
}
