import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, FindOptionsOrder, FindOptionsWhere, ILike, Not, Repository } from 'typeorm';
import { AuthenticatedUser, ErrorCode, CustomException, UserType, UserStatus, AdminStatus, CarparkManagerStatus, PatrolOfficerStatus, TemplateKeys } from '../../common';
import { User } from '../../user/entities/user.entity';
import {
  CreateCarparkManagerRequest,
  CreatePatrolOfficerRequest,
  CreateUserRequest,
  CreateUserResponse,
  FindByIdResponse,
  FindUsersRequest,
  FindUsersResponse,
  GetProfileResponse,
  UpdateNotificationTokenRequest,
  UpdateUserRequest,
  UpdateUserProfileRequest,
  UpdateUserResponse,
} from './user.dto';
import { EmailNotificationService } from '../../common/services/email/email-notification.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { PatrolOfficer } from '../../patrol-officer/entities/patrol-officer.entity';
import { CarparkManager } from '../../carpark-manager/entities/carpark-manager.entity';
import { Admin } from '../entities/admin.entity';
import { CarparkManagerVisitorSubCarPark } from '../../carpark-manager/entities/carpark-manager-visitor-sub-car-park.entity';
import { CarparkManagerWhitelistSubCarPark } from '../../carpark-manager/entities/carpark-manager-whitelist-sub-car-park.entity';
import { CarparkManagerBlacklistSubCarPark } from '../../carpark-manager/entities/carpark-manager-blacklist-sub-car-park.entity';
import { PatrolOfficerVisitorSubCarPark } from '../../patrol-officer/entities/patrol-officer-visitor-sub-car-park.entity';
import { PatrolOfficerWhitelistSubCarPark } from '../../patrol-officer/entities/patrol-officer-whitelist-sub-car-park.entity';
import { PatrolOfficerBlacklistSubCarPark } from '../../patrol-officer/entities/patrol-officer-blacklist-sub-car-park.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailNotificationService: EmailNotificationService,
    private configService: ConfigService,
    private dataSource: DataSource,
    @InjectRepository(CarparkManager)
    private carparkManagerRepository: Repository<CarparkManager>,
    @InjectRepository(PatrolOfficer)
    private patrolOfficerRepository: Repository<PatrolOfficer>,
  ) { }

  async create(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { name, email, type, phoneNumber, image } = request;

    if (type === UserType.SUPER_ADMIN) {
      throw new CustomException(
        ErrorCode.INVALID_USER_TYPE.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if user already exists
    const userInDb = await this.usersRepository.findOne({
      where: { email },
    });
    if (userInDb) {
      throw new CustomException(
        ErrorCode.EMAIL_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = this.usersRepository.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'),
        type,
        phoneNumber,
        image,
        passwordResetToken,
        passwordResetExpires,
        status: UserStatus.ACTIVE,
      });

      const savedUser = await queryRunner.manager.save(User, user);

      // Create user type specific records using case condition
      switch (type) {
        case UserType.ADMIN:
          await this.createAdmin(queryRunner, savedUser);
          break;
        case UserType.CARPARK_MANAGER:
          const carparkManagerRequest: CreateCarparkManagerRequest = {
            name: savedUser.name,
            visitorSubCarParkIds: request.visitorSubCarParkIds,
            whitelistSubCarParkIds: request.whitelistSubCarParkIds,
            blacklistSubCarParkIds: request.blacklistSubCarParkIds,
          };

          await this.createCarparkManager(queryRunner, savedUser, carparkManagerRequest);
          break;
        case UserType.PATROL_OFFICER:
          const patrolOfficerRequest: CreatePatrolOfficerRequest = {
            name: savedUser.name,
            visitorSubCarParkIds: request.visitorSubCarParkIds,
            whitelistSubCarParkIds: request.whitelistSubCarParkIds,
            blacklistSubCarParkIds: request.blacklistSubCarParkIds,
          };

          await this.createPatrolOfficer(queryRunner, savedUser, patrolOfficerRequest);
          break;
        default:
          throw new CustomException(
            ErrorCode.INVALID_USER_TYPE.key,
            HttpStatus.BAD_REQUEST,
          );
      }

      // Send registration email
      const passwordSetupUrl = `${this.configService.get('APP_URL')}/auth/setup-password?token=${passwordResetToken}`;

      try {
        await this.emailNotificationService.sendUsingTemplate({
          to: [savedUser.email],
          templateKey: TemplateKeys.USER_REGISTRATION,
          data: {
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.type,
            phoneNumber: savedUser.phoneNumber,
            passwordSetupUrl: passwordSetupUrl,
          },
        });
      } catch (emailError) {
        throw new CustomException(
          ErrorCode.EMAIL_SEND_FAILED.key,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { email: savedUser.email, error: emailError.message }
        );
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        type: savedUser.type,
        phoneNumber: savedUser.phoneNumber,
        image: savedUser.image,
        passwordResetToken: savedUser.passwordResetToken,
        passwordResetExpires: savedUser.passwordResetExpires,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  private async createAdmin(queryRunner: any, savedUser: User): Promise<void> {
    await queryRunner.manager.save(Admin, {
      userId: savedUser.id,
      status: AdminStatus.ACTIVE,
    });
  }

  private async createCarparkManager(queryRunner: any, savedUser: User, request: CreateCarparkManagerRequest): Promise<void> {
    const carparkManager = await queryRunner.manager.save(CarparkManager, {
      userId: savedUser.id,
      name: savedUser.name,
      status: CarparkManagerStatus.ACTIVE,
    });

    if (request.visitorSubCarParkIds && request.visitorSubCarParkIds.length > 0) {
      for (const subCarParkId of request.visitorSubCarParkIds) {
        await queryRunner.manager.save(CarparkManagerVisitorSubCarPark, {
          carparkManagerId: carparkManager.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.whitelistSubCarParkIds && request.whitelistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.whitelistSubCarParkIds) {
        await queryRunner.manager.save(CarparkManagerWhitelistSubCarPark, {
          carparkManagerId: carparkManager.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.blacklistSubCarParkIds && request.blacklistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.blacklistSubCarParkIds) {
        await queryRunner.manager.save(CarparkManagerBlacklistSubCarPark, {
          carparkManagerId: carparkManager.id,
          subCarParkId: subCarParkId,
        });
      }
    }
  }

  private async createPatrolOfficer(queryRunner: any, savedUser: User, request: CreatePatrolOfficerRequest): Promise<void> {
    const patrolOfficer = await queryRunner.manager.save(PatrolOfficer, {
      officerName: savedUser.name,
      userId: savedUser.id,
      status: PatrolOfficerStatus.ACTIVE,
    });

    if (request.visitorSubCarParkIds && request.visitorSubCarParkIds.length > 0) {
      for (const subCarParkId of request.visitorSubCarParkIds) {
        const subCarPark = await queryRunner.manager.findOne(SubCarPark, { where: { id: subCarParkId } });
        if (!subCarPark) {
          throw new CustomException(
            ErrorCode.PATROL_OFFICER_VISITOR_SUB_CAR_PARK_NOT_FOUND.key,
            HttpStatus.BAD_REQUEST,
          );
        }
        await queryRunner.manager.save(PatrolOfficerVisitorSubCarPark, {
          patrolOfficerId: patrolOfficer.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.whitelistSubCarParkIds && request.whitelistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.whitelistSubCarParkIds) {
        const subCarPark = await queryRunner.manager.findOne(SubCarPark, { where: { id: subCarParkId } });
        if (!subCarPark) {
          throw new CustomException(
            ErrorCode.PATROL_OFFICER_WHITELIST_SUB_CAR_PARK_NOT_FOUND.key,
            HttpStatus.BAD_REQUEST,
          );
        }
        await queryRunner.manager.save(PatrolOfficerWhitelistSubCarPark, {
          patrolOfficerId: patrolOfficer.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.blacklistSubCarParkIds && request.blacklistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.blacklistSubCarParkIds) {
        const subCarPark = await queryRunner.manager.findOne(SubCarPark, { where: { id: subCarParkId } });
        if (!subCarPark) {
          throw new CustomException(
            ErrorCode.PATROL_OFFICER_BLACKLIST_SUB_CAR_PARK_NOT_FOUND.key,
            HttpStatus.BAD_REQUEST,
          );
        }
        await queryRunner.manager.save(PatrolOfficerBlacklistSubCarPark, {
          patrolOfficerId: patrolOfficer.id,
          subCarParkId: subCarParkId,
        });
      }
    }
  }

  private async removeExistingUserTypeRecords(queryRunner: any, userId: string, currentType: UserType): Promise<void> {
    switch (currentType) {
      case UserType.ADMIN:
        const admin = await queryRunner.manager.findOne(Admin, { where: { userId } });
        console.log('dsadasdasdadas');
        if (admin) {
          await queryRunner.manager.remove(Admin, admin);
          console.log('dsadasdasdadas');
        }
        break;
      case UserType.CARPARK_MANAGER:
        const carparkManager = await queryRunner.manager.findOne(CarparkManager, { where: { userId } });
        if (carparkManager) {
          const carparkManagerVisitorSubCarParks = await queryRunner.manager.find(CarparkManagerVisitorSubCarPark, { where: { carparkManagerId: carparkManager.id } });
          const carparkManagerWhitelistSubCarParks = await queryRunner.manager.find(CarparkManagerWhitelistSubCarPark, { where: { carparkManagerId: carparkManager.id } });
          const carparkManagerBlacklistSubCarParks = await queryRunner.manager.find(CarparkManagerBlacklistSubCarPark, { where: { carparkManagerId: carparkManager.id } });
          await queryRunner.manager.remove(CarparkManagerVisitorSubCarPark, carparkManagerVisitorSubCarParks);
          await queryRunner.manager.remove(CarparkManagerWhitelistSubCarPark, carparkManagerWhitelistSubCarParks);
          await queryRunner.manager.remove(CarparkManagerBlacklistSubCarPark, carparkManagerBlacklistSubCarParks);
          await queryRunner.manager.remove(CarparkManager, carparkManager);
        }
        break;
      case UserType.PATROL_OFFICER:
        const patrolOfficer = await queryRunner.manager.findOne(PatrolOfficer, { where: { userId } });
        if (patrolOfficer) {
          const patrolOfficerVisitorSubCarParks = await queryRunner.manager.find(PatrolOfficerVisitorSubCarPark, { where: { patrolOfficerId: patrolOfficer.id } });
          const patrolOfficerWhitelistSubCarParks = await queryRunner.manager.find(PatrolOfficerWhitelistSubCarPark, { where: { patrolOfficerId: patrolOfficer.id } });
          const patrolOfficerBlacklistSubCarParks = await queryRunner.manager.find(PatrolOfficerBlacklistSubCarPark, { where: { patrolOfficerId: patrolOfficer.id } });
          await queryRunner.manager.remove(PatrolOfficerVisitorSubCarPark, patrolOfficerVisitorSubCarParks);
          await queryRunner.manager.remove(PatrolOfficerWhitelistSubCarPark, patrolOfficerWhitelistSubCarParks);
          await queryRunner.manager.remove(PatrolOfficerBlacklistSubCarPark, patrolOfficerBlacklistSubCarParks);
          await queryRunner.manager.remove(PatrolOfficer, patrolOfficer);
        }
        break;
    }
  }

  private async updateAdmin(queryRunner: any, savedUser: User): Promise<void> {
    await queryRunner.manager.save(Admin, {
      status: AdminStatus.ACTIVE,
    });
  }

  private async updateCarparkManager(queryRunner: any, savedUser: User, request: UpdateUserRequest): Promise<void> {
    const carparkManager = await queryRunner.manager.save(CarparkManager, {
      status: CarparkManagerStatus.ACTIVE,
    });

    if (request.visitorSubCarParkIds && request.visitorSubCarParkIds.length > 0) {
      for (const subCarParkId of request.visitorSubCarParkIds) {
        await queryRunner.manager.save(CarparkManagerVisitorSubCarPark, {
          carparkManagerId: carparkManager.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.whitelistSubCarParkIds && request.whitelistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.whitelistSubCarParkIds) {
        await queryRunner.manager.save(CarparkManagerWhitelistSubCarPark, {
          carparkManagerId: carparkManager.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.blacklistSubCarParkIds && request.blacklistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.blacklistSubCarParkIds) {
        await queryRunner.manager.save(CarparkManagerBlacklistSubCarPark, {
          carparkManagerId: carparkManager.id,
          subCarParkId: subCarParkId,
        });
      }
    }
  }

  private async updatePatrolOfficer(queryRunner: any, savedUser: User, request: UpdateUserRequest): Promise<void> {
    const patrolOfficer = await queryRunner.manager.update(PatrolOfficer, { userId: savedUser.id }, {
      officerName: savedUser.name,
      status: PatrolOfficerStatus.ACTIVE,
    });

    if (request.visitorSubCarParkIds && request.visitorSubCarParkIds.length > 0) {
      for (const subCarParkId of request.visitorSubCarParkIds) {
        await queryRunner.manager.save(PatrolOfficerVisitorSubCarPark, {
          patrolOfficerId: patrolOfficer.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.whitelistSubCarParkIds && request.whitelistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.whitelistSubCarParkIds) {
        await queryRunner.manager.save(PatrolOfficerWhitelistSubCarPark, {
          patrolOfficerId: patrolOfficer.id,
          subCarParkId: subCarParkId,
        });
      }
    }

    if (request.blacklistSubCarParkIds && request.blacklistSubCarParkIds.length > 0) {
      for (const subCarParkId of request.blacklistSubCarParkIds) {
        await queryRunner.manager.save(PatrolOfficerBlacklistSubCarPark, {
          patrolOfficerId: patrolOfficer.id,
          subCarParkId: subCarParkId,
        });
      }
    }
  }

  async update(id: string, request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const { name, email, type, phoneNumber, image } = request;

    const userToBeUpdated = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (!userToBeUpdated) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if email is being changed and if it already exists
    if (email !== userToBeUpdated.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email, id: Not(id) },
      });
      if (existingUser) {
        throw new CustomException(
          ErrorCode.EMAIL_ALREADY_EXISTS.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (type === UserType.SUPER_ADMIN) {
      throw new CustomException(
        ErrorCode.INVALID_USER_TYPE.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update user basic information
      userToBeUpdated.name = name;
      userToBeUpdated.email = email;
      userToBeUpdated.phoneNumber = phoneNumber;
      userToBeUpdated.image = image;

      const savedUser = await queryRunner.manager.save(User, userToBeUpdated);
      if (userToBeUpdated.type !== type) {
        await this.removeExistingUserTypeRecords(queryRunner, savedUser.id, userToBeUpdated.type);

        userToBeUpdated.type = type;
        await queryRunner.manager.save(User, userToBeUpdated);
        // Update user type specific records
        switch (type) {
          case UserType.ADMIN:
            await this.createAdmin(queryRunner, savedUser);
            break;
          case UserType.CARPARK_MANAGER:
            await this.createCarparkManager(queryRunner, savedUser, request);
            break;
          case UserType.PATROL_OFFICER:
            await this.createPatrolOfficer(queryRunner, savedUser, request);
            break;
          default:
            throw new CustomException(
              ErrorCode.INVALID_USER_TYPE.key,
              HttpStatus.BAD_REQUEST,
            );
        }
      } else {
        switch (userToBeUpdated.type) {
          case UserType.ADMIN:
            await this.updateAdmin(queryRunner, savedUser);
            break;
          case UserType.CARPARK_MANAGER:
            await this.updateCarparkManager(queryRunner, savedUser, request);
            break;
          case UserType.PATROL_OFFICER:
            await this.updatePatrolOfficer(queryRunner, savedUser, request);
            break;
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        type: savedUser.type,
        phoneNumber: savedUser.phoneNumber,
        image: savedUser.image,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(request: FindUsersRequest): Promise<FindUsersResponse> {
    const { pageNo, pageSize, sortField, sortOrder, search, type, status } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<User>[] = [];
    const orderOptions: FindOptionsOrder<User> = {};

    if (search) {
      whereOptions.push(
        { email: ILike(`%${search}%`) },
        { name: ILike(`%${search}%`) },
      );
    }

    if (type) {
      whereOptions.push({ type });
    }

    if (status) {
      whereOptions.push({ status });
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const options: FindManyOptions<User> = {
      where: whereOptions,
      order: orderOptions,
      skip,
      take,
    };

    const [users, totalItems] = await this.usersRepository.findAndCount(options);

    return {
      rows: users,
      pagination: {
        size: pageSize,
        page: pageNo,
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
      },
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<FindByIdResponse> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    let additionalData = null;

    switch (user.type) {
      case UserType.CARPARK_MANAGER:
        additionalData = await this.carparkManagerRepository.findOne({ where: { userId: id } });
        break;
      case UserType.PATROL_OFFICER:
        additionalData = await this.patrolOfficerRepository.findOne({ where: { userId: id } });
        break;
    }

    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      type: user.type,
      status: user.status,
      visitorSubCarParkIds: additionalData?.visitorSubCarParkIds || [],
      whitelistSubCarParkIds: additionalData?.whitelistSubCarParkIds || [],
      blacklistSubCarParkIds: additionalData?.blacklistSubCarParkIds || [],
    };
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    user.status = UserStatus.INACTIVE;
    await this.usersRepository.save(user);
    return this.usersRepository.softRemove(user);
  }

  async updateNotificationToken(
    request: UpdateNotificationTokenRequest,
    loggedInUser: AuthenticatedUser,
  ): Promise<void> {
    await this.usersRepository.update(loggedInUser.id, {
      // notificationToken: request.token, // Add this field to User entity if needed
    });
  }

  async verifyPasswordResetToken(token: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return null;
    }

    return user;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.verifyPasswordResetToken(token);

    if (!user) {
      return false;
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.emailVerifiedAt = new Date();

    await this.usersRepository.save(user);
    return true;
  }

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return false;
    }
    user.password = newPassword;
    await this.usersRepository.save(user);
    return true;
  }
}
