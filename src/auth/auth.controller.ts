import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Req,
  HttpCode,
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
} from './auth.dto';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}