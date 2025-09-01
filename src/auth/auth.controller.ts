import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Req,
  HttpCode,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuardWithApiBearer } from './guards/jwt-auth.guard';
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

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  public async signUp(@Body() request: SignUpRequest): Promise<void> {
    await this.authService.signUp(request);
  }

  @Post('signup/confirm')
  @HttpCode(HttpStatus.OK)
  public async confirm(@Body() request: ConfirmEmailRequest) {
    return this.authService.confirmEmail(request);
  }

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

  @Post('forget-password/confirm-new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetPassword(@Body() request: ResetPasswordRequest) {
    return this.authService.confirmNewPasswordForForgetPassword(request);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @JwtAuthGuardWithApiBearer()
  public async changePassword(
    @Req() request: any,
    @Body() requestBody: ChangePasswordRequest,
  ) {
    return this.authService.changePassword(request.user, requestBody);
  }

  @Get('setup-password')
  @HttpCode(HttpStatus.OK)
  public async getPasswordSetupPage(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const user = await this.userService.verifyPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
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
      throw new BadRequestException('Token and password are required');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const success = await this.userService.resetPassword(token, password);
    if (!success) {
      throw new BadRequestException('Invalid or expired token');
    }

    return {
      message: 'Password set successfully. You can now login with your email and password.',
    };
  }
}