import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AdminStatus } from '../../common/enums';
import { User } from '../../user/entities/user.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('admin')
@Auditable()
export class Admin extends BaseEntity {

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

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  userId: string;
}
