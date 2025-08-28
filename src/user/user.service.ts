import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { AuthenticatedUser } from '../common';
import { User } from './entities/user.entity';
import { UserAddress } from './entities/user-address.entity';
import {
  CreateUserRequest,
  GetProfileResponse,
  UpdateNotificationTokenRequest,
  UpdateUserAddressRequest,
  UpdateUserDto,
  UpdateUserProfileRequest,
  UserAddressRequest,
} from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
  ) {}

  async create(userDto: CreateUserRequest): Promise<User> {
    const { name, email, password, type, phone, address, city, state, zipCode, status } = userDto;

    // check if the user exists in the db
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
      phone,
      address,
      city,
      state,
      zipCode,
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
    userToBeUpdated.id = id;
    const updatedUser = await this.usersRepository.save(userToBeUpdated);
    return updatedUser;
  }

  async updateAddressRecord(user: User, address: UserAddressRequest) {
    const updatedAddress = await this.userAddressRepository.create(address);
    updatedAddress.user = user;

    return this.userAddressRepository.save(updatedAddress);
  }

  async updateUserAddress(
    user: User,
    updatedAddressDTO: UpdateUserAddressRequest,
  ) {
    const response = { shippingAddressId: '', permanentAddressId: '' };

    if (updatedAddressDTO.shippingAddress) {
      const updatedRecord = await this.updateAddressRecord(
        user,
        updatedAddressDTO.shippingAddress,
      );
      response.shippingAddressId = updatedRecord.id;
    }

    if (updatedAddressDTO.permanentAddress) {
      const updatedRecord = await this.updateAddressRecord(
        user,
        updatedAddressDTO.permanentAddress,
      );
      response.permanentAddressId = updatedRecord.id;
    }

    return response;
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
      relations: ['roles', 'roles.permissions'],
    });
    const permissions: string[] = [];

    user?.roles?.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissions.push(permission.name);
      });
    });
    return permissions;
  }

  async getProfile(id: string): Promise<GetProfileResponse> {
    try {
      const user = await this.findOne({
        where: { id },
        relations: ['roles'],
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        roles:
          user.roles?.map((role) => ({
            id: role.id,
            name: role.name,
          })) || [],
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
