import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import { UserRole } from '../../user/entities/user-role.entity';
import { FileUtils } from '../../common/utils/file.utils';
import { UserType, CarparkManagerStatus } from '../../common/enums';
import { PatrolOfficer } from '../../patrol-officer/entities/patrol-officer.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { PatrolOfficerVisitorSubCarPark } from '../../patrol-officer/entities/patrol-officer-visitor-sub-car-park.entity';
import { PatrolOfficerWhitelistSubCarPark } from '../../patrol-officer/entities/patrol-officer-whitelist-sub-car-park.entity';
import { PatrolOfficerBlacklistSubCarPark } from '../../patrol-officer/entities/patrol-officer-blacklist-sub-car-park.entity';
import { CarparkManager } from '../../carpark-manager/entities/carpark-manager.entity';
import { CarparkManagerVisitorSubCarPark } from '../../carpark-manager/entities/carpark-manager-visitor-sub-car-park.entity';
import { CarparkManagerWhitelistSubCarPark } from '../../carpark-manager/entities/carpark-manager-whitelist-sub-car-park.entity';
import { CarparkManagerBlacklistSubCarPark } from '../../carpark-manager/entities/carpark-manager-blacklist-sub-car-park.entity';

@Injectable()
export class UserSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(PatrolOfficer)
    private readonly patrolOfficerRepository: Repository<PatrolOfficer>,
    @InjectRepository(SubCarPark)
    private readonly subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(PatrolOfficerVisitorSubCarPark)
    private readonly patrolOfficerVisitorSubCarParkRepository: Repository<PatrolOfficerVisitorSubCarPark>,
    @InjectRepository(PatrolOfficerWhitelistSubCarPark)
    private readonly patrolOfficerWhitelistSubCarParkRepository: Repository<PatrolOfficerWhitelistSubCarPark>,
    @InjectRepository(PatrolOfficerBlacklistSubCarPark)
    private readonly patrolOfficerBlacklistSubCarParkRepository: Repository<PatrolOfficerBlacklistSubCarPark>,
    @InjectRepository(CarparkManager)
    private readonly carparkManagerRepository: Repository<CarparkManager>,
    @InjectRepository(CarparkManagerVisitorSubCarPark)
    private readonly carparkManagerVisitorSubCarParkRepository: Repository<CarparkManagerVisitorSubCarPark>,
    @InjectRepository(CarparkManagerWhitelistSubCarPark)
    private readonly carparkManagerWhitelistSubCarParkRepository: Repository<CarparkManagerWhitelistSubCarPark>,
    @InjectRepository(CarparkManagerBlacklistSubCarPark)
    private readonly carparkManagerBlacklistSubCarParkRepository: Repository<CarparkManagerBlacklistSubCarPark>,
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
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!existingUser) {
        // Create new user
        const user = this.userRepository.create({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          type: userData.type as UserType,
          phoneNumber: userData.phone,
          status: userData.status,
        });

        const savedUser = await this.userRepository.save(user);

        // Assign role based on user type
        await this.assignRoleToUser(savedUser, userData.type);

        // Handle patrol officer specific logic
        if (userData.type === 'patrol_officer' && userData.subCarParks) {
          await this.createPatrolOfficer(savedUser, userData);
        }

        // Handle carpark manager specific logic
        if (userData.type === 'carpark_manager' && userData.subCarParks) {
          await this.createCarparkManager(savedUser, userData);
        }

        this.logger.log(`User ${userData.email} seeded with role ${userData.type}`);
      } else {
        this.logger.log(`User ${userData.email} already exists`);

        // Ensure role is assigned
        if (existingUser.userRoles.length === 0) {
          await this.assignRoleToUser(existingUser, userData.type);
          this.logger.log(`Role assigned to existing user ${userData.email}`);
        }
      }
    }
  }

  private async assignRoleToUser(user: User, userType: string) {
    let roleName: string;

    switch (userType) {
      case 'super_admin':
        roleName = 'Super Admin';
        break;
      case 'admin':
        roleName = 'Admin';
        break;
      case 'carpark_manager':
        roleName = 'Carpark Manager';
        break;
      case 'carparkManager':
        roleName = 'Carpark Manager';
        break;
      case 'patrol_officer':
        roleName = 'Patrol Officer';
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
      // Clear existing roles and assign new one
      await this.userRoleRepository.delete({ usersId: user.id });

      const userRole = new UserRole();
      userRole.usersId = user.id;
      userRole.rolesId = role.id;
      await this.userRoleRepository.create(userRole);
    } else {
      this.logger.warn(`Role ${roleName} not found for user ${user.email}`);
    }
  }

  private async createPatrolOfficer(user: User, userData: any) {
    try {
      // Create patrol officer record
      const patrolOfficer = this.patrolOfficerRepository.create({
        officerName: userData.name,
        userId: user.id,
        status: 'active',
      });

      const savedPatrolOfficer = await this.patrolOfficerRepository.save(patrolOfficer);

      // Assign carparks based on type
      if (userData.subCarParks.visitor) {
        await this.assignCarparksToPatrolOfficer(
          savedPatrolOfficer.id,
          userData.subCarParks.visitor,
          'visitor'
        );
      }

      if (userData.subCarParks.whitelist) {
        await this.assignCarparksToPatrolOfficer(
          savedPatrolOfficer.id,
          userData.subCarParks.whitelist,
          'whitelist'
        );
      }

      if (userData.subCarParks.blacklist) {
        await this.assignCarparksToPatrolOfficer(
          savedPatrolOfficer.id,
          userData.subCarParks.blacklist,
          'blacklist'
        );
      }

      this.logger.log(`Patrol officer ${userData.name} created with assigned carparks`);
    } catch (error) {
      this.logger.error(`Error creating patrol officer for user ${user.email}:`, error);
    }
  }

  private async assignCarparksToPatrolOfficer(
    patrolOfficerId: string,
    carparkCodes: string[],
    type: 'visitor' | 'whitelist' | 'blacklist'
  ) {
    for (const code of carparkCodes) {
      try {
        const subCarPark = await this.subCarParkRepository.findOne({
          where: { subCarParkCode: code },
        });

        if (!subCarPark) {
          this.logger.warn(`SubCarPark with code ${code} not found`);
          continue;
        }

        let assignment;
        switch (type) {
          case 'visitor':
            assignment = this.patrolOfficerVisitorSubCarParkRepository.create({
              patrolOfficerId,
              subCarParkId: subCarPark.id,
            });
            await this.patrolOfficerVisitorSubCarParkRepository.save(assignment);
            break;

          case 'whitelist':
            assignment = this.patrolOfficerWhitelistSubCarParkRepository.create({
              patrolOfficerId,
              subCarParkId: subCarPark.id,
            });
            await this.patrolOfficerWhitelistSubCarParkRepository.save(assignment);
            break;

          case 'blacklist':
            assignment = this.patrolOfficerBlacklistSubCarParkRepository.create({
              patrolOfficerId,
              subCarParkId: subCarPark.id,
            });
            await this.patrolOfficerBlacklistSubCarParkRepository.save(assignment);
            break;
        }

        this.logger.log(`Assigned ${type} carpark ${code} to patrol officer`);
      } catch (error) {
        this.logger.error(`Error assigning ${type} carpark ${code}:`, error);
      }
    }
  }

  private async createCarparkManager(user: User, userData: any) {
    try {
      // Create carpark manager record
      const carparkManager = this.carparkManagerRepository.create({
        userId: user.id,
        status: CarparkManagerStatus.ACTIVE,
        canManagePatrolOfficers: true,
        canGenerateReports: true,
        canManageTenancies: true,
      });

      const savedCarparkManager = await this.carparkManagerRepository.save(carparkManager);

      // Assign carparks based on type
      if (userData.subCarParks.visitor) {
        await this.assignCarparksToCarparkManager(
          savedCarparkManager.id,
          userData.subCarParks.visitor,
          'visitor'
        );
      }

      if (userData.subCarParks.whitelist) {
        await this.assignCarparksToCarparkManager(
          savedCarparkManager.id,
          userData.subCarParks.whitelist,
          'whitelist'
        );
      }

      if (userData.subCarParks.blacklist) {
        await this.assignCarparksToCarparkManager(
          savedCarparkManager.id,
          userData.subCarParks.blacklist,
          'blacklist'
        );
      }

      this.logger.log(`Carpark manager ${userData.name} created with assigned carparks`);
    } catch (error) {
      this.logger.error(`Error creating carpark manager for user ${user.email}:`, error);
    }
  }

  private async assignCarparksToCarparkManager(
    carparkManagerId: string,
    carparkCodes: string[],
    type: 'visitor' | 'whitelist' | 'blacklist'
  ) {
    for (const code of carparkCodes) {
      try {
        const subCarPark = await this.subCarParkRepository.findOne({
          where: { subCarParkCode: code },
        });

        if (!subCarPark) {
          this.logger.warn(`SubCarPark with code ${code} not found`);
          continue;
        }

        let assignment;
        switch (type) {
          case 'visitor':
            assignment = this.carparkManagerVisitorSubCarParkRepository.create({
              carparkManagerId,
              subCarParkId: subCarPark.id,
            });
            await this.carparkManagerVisitorSubCarParkRepository.save(assignment);
            break;

          case 'whitelist':
            assignment = this.carparkManagerWhitelistSubCarParkRepository.create({
              carparkManagerId,
              subCarParkId: subCarPark.id,
            });
            await this.carparkManagerWhitelistSubCarParkRepository.save(assignment);
            break;

          case 'blacklist':
            assignment = this.carparkManagerBlacklistSubCarParkRepository.create({
              carparkManagerId,
              subCarParkId: subCarPark.id,
            });
            await this.carparkManagerBlacklistSubCarParkRepository.save(assignment);
            break;
        }

        this.logger.log(`Assigned ${type} carpark ${code} to carpark manager`);
      } catch (error) {
        this.logger.error(`Error assigning ${type} carpark ${code}:`, error);
      }
    }
  }
}
