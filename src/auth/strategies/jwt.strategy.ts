import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { ConfigKeys } from '../../common/configs';
import { AuthenticatedUser } from '../../common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ConfigKeys.JWT_SECRET),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      
      // Get user permissions
      const permissions = await this.userService.findAllPermissions(user.id);
      
      // Create AuthenticatedUser object
      const authenticatedUser = new AuthenticatedUser(
        user.id,
        user.email,
        user.name,
        '', // profileImageUrl - add if available
        user.phone || '',
        user.type,
        [], // roles - add if needed
        permissions,
      );
      
      return authenticatedUser;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
