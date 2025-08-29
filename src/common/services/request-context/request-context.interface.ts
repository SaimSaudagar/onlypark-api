import { AuthenticatedUser } from '../../types';
import { AuditLog } from '../audit-log/entities/audit-log.entity';

export interface RequestContext {
  user?: AuthenticatedUser;
  traceId?: string;
  auditLog?: AuditLog[];
}
