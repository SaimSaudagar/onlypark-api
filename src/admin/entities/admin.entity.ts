import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AdminAccessLevel, AdminStatus } from '../../common/enums';
import { User } from '../../user/entities/user.entity';
import { Auditable } from '../../common/decorators';

@Entity('admin')
@Auditable()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  adminCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({
    type: 'enum',
    enum: AdminAccessLevel,
    default: AdminAccessLevel.FULL,
  })
  accessLevel: AdminAccessLevel;

  @Column({ type: 'boolean', default: true })
  canManageUsers: boolean;

  @Column({ type: 'boolean', default: true })
  canManageRoles: boolean;

  @Column({ type: 'boolean', default: true })
  canManageSystem: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'int', default: 0 })
  loginCount: number;

  @Column({
    type: 'enum',
    enum: AdminStatus,
    default: AdminStatus.ACTIVE,
  })
  status: AdminStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
