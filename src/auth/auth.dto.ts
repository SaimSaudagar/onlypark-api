import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiRequest, UserType } from '../common';

export class SignUpRequest {
  @IsNotEmpty() name: string;
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() password: string;
  @IsNotEmpty() type: UserType;
  @IsNotEmpty() phoneNumber: string;
  @IsNotEmpty() verified: boolean;
}

export class LoginRequest extends ApiRequest {
  @IsNotEmpty() @IsEmail() readonly email: string;
  @IsNotEmpty() readonly password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  type: string;
  accessToken: string;
}

export class ConfirmEmailRequest {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
  @IsNotEmpty()
  readonly confirmationCode: string;
}

export class SendLinkForForgetPasswordRequest {
  @IsNotEmpty()
  readonly email: string;
}

export class ResetPasswordRequest {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
  @IsNotEmpty()
  readonly password: string;
  @IsNotEmpty()
  readonly token: string;
}

export class ChangePasswordRequest {
  @IsNotEmpty()
  readonly currentPassword: string;
  @IsNotEmpty()
  readonly newPassword: string;
}

export class SetupPasswordRequest {
  @IsNotEmpty()
  readonly token: string;
  @IsNotEmpty()
  readonly password: string;
}