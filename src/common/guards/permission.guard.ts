import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticatedUser } from "../types";
import { RequestContextService } from "../services/request-context/request-context.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly requestContextService: RequestContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const parameter = this.reflector.get<string[]>(
      "permissions",
      context.getHandler(),
    );
    if (!parameter) {
      return true; // No specific permission required
    }
    const requiredPermissions = parameter.map((permission) => {
      const [subject, action] = permission.split(".");
      return {
        subject,
        action,
      };
    });
    const user: AuthenticatedUser = this.requestContextService.get()?.user;
    return this.userHasPermission(user, requiredPermissions);
  }

  private userHasPermission(
    user: AuthenticatedUser,
    requiredPermissions: { subject: string; action: string }[],
  ): boolean {
    const userPermissions = user?.permissions || [];
    return requiredPermissions.every((permission) =>
      userPermissions.some(
        (userPerm) => userPerm === `${permission.subject}.${permission.action}`,
      ),
    );
  }
}
