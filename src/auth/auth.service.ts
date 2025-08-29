import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
      throw new BadRequestException('User with this email already exists');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(request.password, 10);

    const user = this.userService.create({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      phoneNumber: request.phoneNumber,
      type: request.type,
      status: UserStatus.ACTIVE,
    });
  }

  async confirmEmail(request: ConfirmEmailRequest): Promise<boolean> {
    const user = await this.userService.findOne({
      where: { email: request.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.emailVerifiedAt = new Date();
    await this.userService.update(user.id, user);

    return true;
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

  async sendLinkForForgetPassword(request: SendLinkForForgetPasswordRequest): Promise<boolean> {
    const user = await this.userService.findOne({
      where: { email: request.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // TODO: Implement email sending logic
    // For now, just return true
    return true;
  }

  async confirmNewPasswordForForgetPassword(request: ResetPasswordRequest): Promise<boolean> {
    const user = await this.userService.findOne({
      where: { email: request.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.email !== request.email) {
      throw new BadRequestException('User not found');
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(request.password, 10);
    user.password = hashedPassword;
    await this.userService.update(user.id, user);

    return true;
  }

  async changePassword(user: any, request: ChangePasswordRequest): Promise<void> {
    const userEntity = await this.userService.findOne({
      where: { id: user.id },
    });

    if (!userEntity) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      request.currentPassword,
      userEntity.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(request.newPassword, 10);
    userEntity.password = hashedPassword;
    await this.userService.update(userEntity.id, userEntity);
  }
}
