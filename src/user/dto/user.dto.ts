import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString, ValidateNested, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserType, AddressType, UserStatus } from '../../common/enums';

export class CreateUserRequest {
  @IsNotEmpty() 
  @IsString()
  name: string;

  @IsNotEmpty() 
  @IsEmail() 
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  status: UserStatus = UserStatus.ACTIVE;

  @IsOptional()
  emailVerifiedAt?: Date;

  @IsOptional()
  rememberToken?: string;
}

export class UpdateUserDto extends PartialType(CreateUserRequest) {}

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
