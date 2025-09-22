import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Req,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ChangePasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest,
  ConfirmEmailRequest,
  SendLinkForForgetPasswordRequest,
  SetupPasswordRequest,
} from './auth.dto';
import { UserService } from '../user/user.service';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Post('login')
  public async login(@Body() request: LoginRequest) {
    const loginInfo = await this.authService.login(request);
    return loginInfo;
  }

  @Post('forget-password/send-link')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async sendLinkForForgetPassword(
    @Body() request: SendLinkForForgetPasswordRequest,
  ) {
    return this.authService.sendLinkForForgetPassword(request);
  }

  @Get('setup-password')
  @HttpCode(HttpStatus.OK)
  public async getPasswordSetupPage(@Query('token') token: string) {
    if (!token) {
      throw new CustomException(
        ErrorCode.TOKEN_REQUIRED.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.verifyPasswordResetToken(token);
    if (!user) {
      throw new CustomException(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Return a simple HTML page for password setup
    // In a real application, this would redirect to a frontend page
    return {
      message: 'Token is valid. Please proceed to set your password.',
      userId: user.id,
      email: user.email,
      token: token,
    };
  }

  @Post('setup-password')
  @HttpCode(HttpStatus.OK)
  public async setupPassword(
    @Body() request: SetupPasswordRequest,
  ) {
    const { token, password } = request;

    if (!token || !password) {
      throw new CustomException(
        ErrorCode.TOKEN_AND_PASSWORD_REQUIRED.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (password.length < 6) {
      throw new CustomException(
        ErrorCode.PASSWORD_TOO_SHORT.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const success = await this.userService.resetPassword(token, password);
    if (!success) {
      throw new CustomException(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Password set successfully. You can now login with your email and password.',
    };
  }
}