import { Reflector } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { AUDITABLE_KEY } from '../../decorators/auditable.decorator';
import { Action } from './audit-log.enum';
import { RequestContextService } from '../request-context/request-context.service';
import { AuditLogService } from './audit-log.service';

export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger: Logger;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditService: AuditLogService,
    private readonly reflector: Reflector,
    private readonly requestContextService: RequestContextService,
  ) {
    this.logger = new Logger(AuditSubscriber.name);
    this.dataSource.subscribers.push(this);
    this.logger.log('AuditSubscriber initialized');
  }

  afterInsert(event: InsertEvent<any>): void {
    if (!this.isAuditable(event.entity)) return;
    this.logger.log(`afterInsert triggered for entity: ${event.metadata.name}`);
    this.createAuditLog(
      Action.INSERT,
      event.metadata.tableName,
      event.entity.id,
      {},
      event.entity,
    );
  }

  afterUpdate(event: UpdateEvent<any>): void {
    if (!this.isAuditable(event.entity)) return;
    this.logger.log(`afterUpdate triggered for entity: ${event.metadata.name}`);
    this.createAuditLog(
      Action.UPDATE,
      event.metadata.tableName,
      event.entity.id,
      event.databaseEntity,
      event.entity,
    );
  }

  afterRemove(event: RemoveEvent<any>): void | Promise<any> {
    if (!this.isAuditable(event.entity)) return;
    this.logger.log(`afterRemove triggered for entity: ${event.metadata.name}`);
    this.createAuditLog(
      Action.DELETE,
      event.metadata.tableName,
      event.entityId,
      event.databaseEntity,
      {},
    );
  }

  private async createAuditLog(
    action: Action,
    entityName: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
  ) {
    const context = this.requestContextService.get();
    const userId = context.user !== undefined ? context.user.id : null;

    try {
      await this.auditService.createAuditLog({
        entityName: entityName,
        entityId: entityId,
        action,
        oldValue: oldValues,
        newValue: newValues,
        userId,
      });
      this.logger.log('Audit log created successfully');
    } catch (error) {
      this.logger.error('Error creating audit log', error.stack);
    }
  }

  private isAuditable(entity: any): boolean {
    return (
      this.reflector.get<boolean>(AUDITABLE_KEY, entity.constructor) || false
    );
  }
}
