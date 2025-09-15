import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class JwtAuthenticationGuard extends AuthGuard('jwt') {}

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthenticationGuard {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    // If there's no authorization header, allow access without validation
    if (!authorizationHeader) {
      return true;
    }

    // If an authorization header exists, call the parent's canActivate for validation
    return super.canActivate(context);
  }
}
