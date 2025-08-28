import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Action } from '../audit-log.enum';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityName: string;

  @Column()
  entityId: string;

  @Column({
    type: 'enum',
    enum: Action,
  })
  action: Action;

  @Column({ type: 'json', nullable: true })
  oldValue: object | null;

  @Column({ type: 'json', nullable: true })
  newValue: object | null;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
