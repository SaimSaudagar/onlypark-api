import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import { FileUtils } from '../../common/utils/file.utils';
import { UserType } from '../../common/enums';

@Injectable()
export class UserSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('Starting User Data seed');
    const users = FileUtils.getDataForSeeding('users');

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
        relations: ['roles'],
      });

      if (!existingUser) {
        // Create new user
        const user = this.userRepository.create({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          type: userData.type as UserType,
          phone: userData.phone,
          status: userData.status,
        });

        const savedUser = await this.userRepository.save(user);

        // Assign role based on user type
        await this.assignRoleToUser(savedUser, userData.type);

        this.logger.log(`User ${userData.email} seeded with role ${userData.type}`);
      } else {
        this.logger.log(`User ${userData.email} already exists`);
        
        // Ensure role is assigned
        if (existingUser.roles.length === 0) {
          await this.assignRoleToUser(existingUser, userData.type);
          this.logger.log(`Role assigned to existing user ${userData.email}`);
        }
      }
    }
  }

  private async assignRoleToUser(user: User, userType: string) {
    let roleName: string;

    switch (userType) {
      case 'admin':
        roleName = user.email.includes('superadmin') ? 'Super Admin' : 'Admin';
        break;
      case 'carparkManager':
        roleName = 'Carpark Manager';
        break;
      case 'officer':
        roleName = 'Patrol Officer';
        break;
      case 'user':
        roleName = 'User';
        break;
      default:
        roleName = 'User';
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (role) {
      user.roles = [role];
      await this.userRepository.save(user);
    } else {
      this.logger.warn(`Role ${roleName} not found for user ${user.email}`);
    }
  }
}
