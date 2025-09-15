import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  SetMetadata,
  CustomDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '../../common/exceptions/error-code';
import { CustomException } from '../../common/exceptions/custom.exception';
import { RequestContextService } from '../../common/services/request-context/request-context.service';
import { GUARD_KEYS } from '../../common/configs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly requestContextService: RequestContextService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredUserTypes = this.reflector.get<string[]>(
      GUARD_KEYS.ALLOWED_ROLE,
      context.getHandler(),
    );
    if (!requiredUserTypes) {
      return true; // No user type restriction on this route
    }
    const user = this.requestContextService?.get()?.user;
    if (!user || !requiredUserTypes.includes(user?.userType)) {
      throw new CustomException(
        ErrorCode.UNAUTHORIZED.key,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}

export function AllowedRoles(...roles: string[]): CustomDecorator<string> {
  return SetMetadata(GUARD_KEYS.ALLOWED_ROLE, roles);
}
