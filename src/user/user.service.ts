import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { AuthenticatedUser, ErrorCode, CustomException, UserType, UserStatus } from '../common';
import { User } from './entities/user.entity';
import {
  CreateUserRequest,
  GetProfileResponse,
  UpdateNotificationTokenRequest,
  UpdateUserDto,
  UpdateUserProfileRequest,
} from './user.dto';
import { AdminService } from '../admin/admin.service';
import { CarparkManagerService } from '../carpark-manager/carpark-manager.service';
import { PatrolOfficerService } from '../patrol-officer/patrol-officer.service';
import { EmailService } from '../common/services/email/email.service';
import { WhitelistService } from '../whitelist/whitelist.service';
import { BlacklistService } from '../blacklist/blacklist.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private adminService: AdminService,
    private carparkManagerService: CarparkManagerService,
    private patrolOfficerService: PatrolOfficerService,
    private emailService: EmailService,
    private whitelistService: WhitelistService,
    private blacklistService: BlacklistService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) { }

  async create(userDto: CreateUserRequest): Promise<User> {
    const { name, email, type, phoneNumber, image, whitelist, blacklist } = userDto;

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
      });

      const savedUser = await queryRunner.manager.save(User, user);

      if (type === UserType.ADMIN) {
        await queryRunner.manager.save('Admin', {
          userId: savedUser.id,
          status: 'active',
        });
      } else if (type === UserType.CARPARK_MANAGER) {
        await queryRunner.manager.save('CarparkManager', {
          userId: savedUser.id,
          managerCode: savedUser.id,
          assignedCarParks: {},
          status: 'active',
        });
      } else if (type === UserType.PATROL_OFFICER) {
        await queryRunner.manager.save('PatrolOfficer', {
          userId: savedUser.id,
        });
      }

      // Create whitelist entries if provided
      if (whitelist && whitelist.length > 0) {
        for (const vehicleReg of whitelist) {
          await queryRunner.manager.save('Whitelist', {
            vehicalRegistration: vehicleReg,
            email: savedUser.email,
            comments: `Created for user: ${savedUser.name}`,
          });
        }
      }

      // Create blacklist entries if provided
      if (blacklist && blacklist.length > 0) {
        for (const vehicleReg of blacklist) {
          await queryRunner.manager.save('BlacklistReg', {
            regNo: vehicleReg,
            email: savedUser.email,
            comments: `Created for user: ${savedUser.name}`,
            subCarParkCode: 'default', // You might want to make this configurable
            status: 'active',
          });
        }
      }

      // Send registration email
      const passwordSetupUrl = `${this.configService.get('APP_URL')}/auth/setup-password?token=${passwordResetToken}`;

      let emailResult;
      try {
        emailResult = await this.emailService.sendUserRegistrationEmail(
          savedUser.email,
          savedUser.name,
          savedUser.email,
          savedUser.type,
          savedUser.phoneNumber || '',
          passwordSetupUrl,
        );
      } catch (emailError) {
        // Log email error but don't fail the transaction
        console.error(`Failed to send email to ${savedUser.email}: ${emailError.message}`);
        emailResult = { sent: false, errorMessage: emailError.message };
      }

      // If email fails, log the error but don't rollback the transaction
      // since the user was created successfully
      if (!emailResult.sent) {
        console.error(`Failed to send email to ${savedUser.email}: ${emailResult.errorMessage}`);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      throw new CustomException(
        ErrorCode.CLIENT_ERROR.key,
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(options?: FindManyOptions<User>): Promise<User[]> {
    return await this.usersRepository.find(options);
  }

  async findOne(options?: FindOneOptions<User>): Promise<User> {
    const user = await this.usersRepository.findOne(options);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userToBeUpdated = await this.usersRepository.create(updateUserDto);
    const updatedUser = await this.usersRepository.save(userToBeUpdated);
    return updatedUser;
  }

  async updateUserProfile(
    user: User,
    updatedProfile: UpdateUserProfileRequest,
  ) {
    const updatedUser = await this.usersRepository.update(
      user.id,
      updatedProfile,
    );
    return updatedUser;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async updateNotificationToken(
    request: UpdateNotificationTokenRequest,
    loggedInUser: AuthenticatedUser,
  ): Promise<void> {
    await this.usersRepository.update(loggedInUser.id, {
      // notificationToken: request.token, // Add this field to User entity if needed
    });
  }

  //TODO: Remove <any>
  async findAllPermissions(id: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { userRoles: { role: { rolePermissions: { permission: true } } } },
    });
    const permissions: string[] = [];

    user?.userRoles?.forEach((userRole) => {
      userRole.role?.rolePermissions?.forEach((rolePermission) => {
        permissions.push(rolePermission.permission.name);
      });
    });
    return permissions;
  }

  async getProfile(id: string): Promise<GetProfileResponse> {
    try {
      const user = await this.findOne({
        where: { id },
        relations: ['userRoles', 'userRoles.role'],
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        phoneNumber: user.phoneNumber,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        roles:
          user.userRoles?.map((userRole) => ({
            id: userRole.role.id,
            name: userRole.role.name,
          })) || [],
      };
    } catch (error) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }
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
}
