import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CarparkManagerLevel, CarparkManagerStatus } from '../../common/enums';
import { User } from '../../user/entities/user.entity';
import { Auditable } from '../../common/decorators';

@Entity('carpark_manager')
@Auditable()
export class CarparkManager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  managerCode: string;

  @Column({ type: 'json', nullable: false })
  assignedCarParks: string[];

  @Column({ type: 'varchar', nullable: true })
  region: string;

  @Column({ type: 'varchar', nullable: true })
  contactNumber: string;

  @Column({ type: 'varchar', nullable: true })
  emergencyContact: string;

  @Column({
    type: 'enum',
    enum: CarparkManagerLevel,
    default: CarparkManagerLevel.SENIOR,
  })
  managerLevel: CarparkManagerLevel;

  @Column({ type: 'boolean', default: true })
  canManagePatrolOfficers: boolean;

  @Column({ type: 'boolean', default: true })
  canGenerateReports: boolean;

  @Column({ type: 'boolean', default: true })
  canManageTenancies: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'int', default: 0 })
  loginCount: number;

  @Column({
    type: 'enum',
    enum: CarparkManagerStatus,
    default: CarparkManagerStatus.ACTIVE,
  })
  status: CarparkManagerStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
