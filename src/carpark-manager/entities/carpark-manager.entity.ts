import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CarparkManagerStatus } from '../../common/enums';
import { User } from '../../user/entities/user.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';

@Entity('carpark_manager')
@Auditable()
export class CarparkManager extends BaseEntity {

  @Column({ type: 'varchar', unique: true, nullable: false })
  managerCode: string;

  @OneToMany(() => SubCarPark, (subCarPark) => subCarPark.carparkManager)
  subCarParks: SubCarPark[];

  @Column({ type: 'varchar', nullable: true })
  region: string;

  @Column({ type: 'varchar', nullable: true })
  contactNumber: string;

  @Column({ type: 'varchar', nullable: true })
  emergencyContact: string;

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

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
