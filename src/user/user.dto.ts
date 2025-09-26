import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString, ValidateNested, IsOptional, IsEnum, MinLength, IsArray, IsUUID } from 'class-validator';
import { UserType, AddressType, UserStatus } from '../common/enums';
import { ApiGetBaseRequest, ApiGetBaseResponse } from '../common';

export class CreateUserRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  visitorSubCarParkIds: string[];


  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  whitelistSubCarParkIds: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  blacklistSubCarParkIds: string[];
  // @IsOptional()
  // @IsArray()
  // @IsString({ each: true })
}

export class CreateUserResponse {
  id: string;
  name: string;
  email: string;
  type: UserType;
  phoneNumber: string;
  image: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
}

export class UpdateUserDto extends CreateUserRequest {
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class UpdateUserProfileRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}

export interface GetProfileResponse {
  id: string;
  name: string;
  email: string;
  type: UserType;
  phoneNumber: string;
  status: string;
  emailVerifiedAt?: Date;
  createdAt: Date;
  roles: {
    id: string;
    name: string;
  }[];
}

export class UpdateNotificationTokenRequest {
  @IsString()
  token: string;
}

export class UserAddressRequest {
  id?: string;
  @IsNotEmpty() country: string;
  @IsNotEmpty() city: string;
  @IsNotEmpty() region: string;
  @IsNotEmpty() addressLineOne: string;
  @IsNotEmpty() addressLineTwo: string;
  @IsNotEmpty() postalCode: string;
  addressType?: AddressType;
}

export class UpdateUserAddressRequest {
  @Type(() => UserAddressRequest)
  @ValidateNested()
  shippingAddress: UserAddressRequest;

  @Type(() => UserAddressRequest)
  @ValidateNested()
  permanentAddress: UserAddressRequest;
}

// Example DTOs using ApiGetBaseRequest and ApiGetBaseResponse
export class FindUsersRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserType)
  type?: UserType;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  type: UserType;
  phoneNumber: string;
  status: UserStatus;
  emailVerifiedAt?: Date;
  createdAt: Date;
}

export type FindUsersResponse = ApiGetBaseResponse<UserResponse>;

export class CreatePatrolOfficerRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visitorSubCarParkIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whitelistSubCarParkIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blacklistSubCarParkIds: string[];
}
export class CreateCarparkManagerRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visitorSubCarParkIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whitelistSubCarParkIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blacklistSubCarParkIds: string[];
}

export class FindByIdResponse {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  type: UserType;
  status: UserStatus;
  visitorSubCarParkIds: string[];
  whitelistSubCarParkIds: string[];
  blacklistSubCarParkIds: string[];
}