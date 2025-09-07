import {
  Entity,
  Column,
} from 'typeorm';
import { AuditAction } from '../../../enums';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {

  @Column()
  entityName: string;

  @Column()
  entityId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'json', nullable: true })
  oldValue: object | null;

  @Column({ type: 'json', nullable: true })
  newValue: object | null;

  @Column({ nullable: true })
  userId: string;
}
