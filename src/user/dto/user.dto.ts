import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString, ValidateNested, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserType, AddressType } from '../../common/enums';

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
  phone?: string;

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

  @IsOptional()
  @IsString()
  status?: string = 'active';

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
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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
