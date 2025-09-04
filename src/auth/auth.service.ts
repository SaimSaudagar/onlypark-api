import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { JwtPayload } from '../common/types';
import { UserStatus, UserType } from '../common/enums';

import {
  SignUpRequest,
  LoginRequest,
  ConfirmEmailRequest,
  SendLinkForForgetPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from './auth.dto';
import { ErrorCode } from '../common/exceptions/error-code';
import { CustomException } from '../common/exceptions/custom.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async signUp(request: SignUpRequest): Promise<void> {
    const existingUser = await this.userService.findOne({
      where: { email: request.email },
    });

    if (existingUser) {
      throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS.key, HttpStatus.BAD_REQUEST);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(request.password, 10);

    const user = this.userService.create({
      name: request.name,
      email: request.email,
      phoneNumber: request.phoneNumber,
      type: request.type,
    });
  }

  async confirmEmail(confirmEmailRequest: ConfirmEmailRequest): Promise<void> {
    const user = await this.userService.findOne({ where: { email: confirmEmailRequest.email } });
    if (!user) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    user.emailVerifiedAt = new Date();
    await this.userService.update(user.id, user);
  }

  async login(request: LoginRequest) {
    const user = await this.userService.findOne({
      where: { email: request.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      userType: user.type,
      twoFactorEnabled: false,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      type: user.type,
    };
  }

  async sendLinkForForgetPassword(
    sendLinkForForgetPasswordRequest: SendLinkForForgetPasswordRequest,
  ): Promise<void> {
    const user = await this.userService.findOne({ where: { email: sendLinkForForgetPasswordRequest.email } });
    if (!user) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // TODO: Implement email sending logic
    // For now, just return true
  }

  async confirmNewPasswordForForgetPassword(
    resetPasswordRequest: ResetPasswordRequest,
  ): Promise<void> {
    const user = await this.userService.findOne({ where: { email: resetPasswordRequest.email } });
    if (!user) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.email !== resetPasswordRequest.email) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(resetPasswordRequest.password, 10);
    user.password = hashedPassword;
    await this.userService.update(user.id, user);
  }

  async changePassword(user: any, changePasswordRequest: ChangePasswordRequest): Promise<void> {
    const userInDb = await this.userService.findOne(user.id);
    if (!userInDb) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordRequest.currentPassword,
      userInDb.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(changePasswordRequest.newPassword, 10);
    userInDb.password = hashedPassword;
    await this.userService.update(userInDb.id, userInDb);
  }
}
