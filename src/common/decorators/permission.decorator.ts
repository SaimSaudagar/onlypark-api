import { SetMetadata } from "@nestjs/common";

// Use strings in the format 'subject.action' for permissions
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata("permissions", permissions);
