import { Injectable, HttpStatus } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { UserService } from "../../user/user.service";
import { ConfigKeys } from "../../common/configs";
import { AuthenticatedUser } from "../../common";
import { RequestContextService } from "../../common/services/request-context/request-context.service";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly requestContextService: RequestContextService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ConfigKeys.JWT_SECRET),
    });
  }

  async validate(request: Request, payload: any) {
    try {
      const user = await this.userService.findById(payload.id);
      if (!user) {
        throw new CustomException(
          ErrorCode.UNAUTHORIZED.key,
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Get user permissions
      // const permissions = await this.userService. findAllPermissions(user.id);

      // Create AuthenticatedUser object
      const authenticatedUser = new AuthenticatedUser(
        user.id,
        user.email,
        user.name,
        "", // profileImageUrl - add if available
        user.phoneNumber || "",
        user.type,
        [], // roles - add if needed
        [], // permissions - add if needed
      );

      // Set request context like dawlati implementation
      const requestContext = this.requestContextService.get();
      requestContext.user = authenticatedUser;
      this.requestContextService.set(requestContext);

      return authenticatedUser;
    } catch (error) {
      throw new CustomException(
        ErrorCode.UNAUTHORIZED.key,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
