import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import JwtAuthGuard from "./guards/jwt-auth.guard";
import { RoleGuard } from "./guards/roles.guard";

import { UserModule } from "../user/user.module";
import { ConfigKeys } from "../common/configs";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(ConfigKeys.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(ConfigKeys.JWT_EXPIRATION_TIME),
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RoleGuard],
  exports: [AuthService, JwtAuthGuard, RoleGuard, PassportModule],
})
export class AuthModule {}
