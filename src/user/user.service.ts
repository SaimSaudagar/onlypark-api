import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { AuthenticatedUser } from '../common';
import { User } from './entities/user.entity';
import {
  CreateUserRequest,
  GetProfileResponse,
  UpdateNotificationTokenRequest,
  UpdateUserDto,
  UpdateUserProfileRequest,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(userDto: CreateUserRequest): Promise<User> {
    const { name, email, password, type, phoneNumber, status } = userDto;

    const userInDb = await this.usersRepository.findOne({
      where: { email },
    });
    if (userInDb) {
      throw new BadRequestException('User already exists');
    }

    const user: User = await this.usersRepository.create({
      name,
      email,
      password,
      type,
      phoneNumber,
      status,
    });
    await this.usersRepository.save(user);
    return user;
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
      throw new BadRequestException('User not found');
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
      throw new BadRequestException(error.message);
    }
  }
}
