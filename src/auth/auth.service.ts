import { Injectable, UnauthorizedException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UserService } from "../user/user.service";
import { JwtPayload } from "../common/types";
import { LoginRequest, SendLinkForForgetPasswordRequest } from "./auth.dto";
import { ErrorCode } from "../common/exceptions/error-code";
import { CustomException } from "../common/exceptions/custom.exception";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(request: LoginRequest) {
    const user = await this.userService.findByEmail(request.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
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
    const user = await this.userService.findById(
      sendLinkForForgetPasswordRequest.email,
    );
    if (!user) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // TODO: Implement email sending logic
    // For now, just return true
  }
}
