import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { PatrolOfficerVisitorSubCarPark } from './patrol-officer-visitor-sub-car-park.entity';
import { PatrolOfficerWhitelistSubCarPark } from './patrol-officer-whitelist-sub-car-park.entity';
import { PatrolOfficerBlacklistSubCarPark } from './patrol-officer-blacklist-sub-car-park.entity';
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

  @OneToMany(() => PatrolOfficerVisitorSubCarPark, (patrolOfficerVisitorSubCarPark) => patrolOfficerVisitorSubCarPark.patrolOfficer)
  patrolOfficerVisitorSubCarParks: PatrolOfficerVisitorSubCarPark[];

  @OneToMany(() => PatrolOfficerWhitelistSubCarPark, (patrolOfficerWhitelistSubCarPark) => patrolOfficerWhitelistSubCarPark.patrolOfficer)
  patrolOfficerWhitelistSubCarParks: PatrolOfficerWhitelistSubCarPark[];

  @OneToMany(() => PatrolOfficerBlacklistSubCarPark, (patrolOfficerBlacklistSubCarPark) => patrolOfficerBlacklistSubCarPark.patrolOfficer)
  patrolOfficerBlacklistSubCarParks: PatrolOfficerBlacklistSubCarPark[];
}
