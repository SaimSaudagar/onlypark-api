import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction } from '../../enums';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createAuditLog(params: {
    entityName: string;
    entityId: string;
    action: AuditAction;
    oldValue: object;
    newValue: object;
    userId: string;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(params);
    return await this.auditLogRepository.save(auditLog);
  }
}
