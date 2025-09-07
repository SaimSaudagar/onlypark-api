import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('patrol_officer')
@Auditable()
export class PatrolOfficer extends BaseEntity {

  @Column({ type: 'varchar', nullable: false })
  officerName: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.patrolOfficers)
  @JoinColumn({ name: 'subCarParkIds' })
  subCarParks: SubCarPark[];

  @Column({ type: 'varchar', nullable: true })
  subCarParkIds: string[];
}
