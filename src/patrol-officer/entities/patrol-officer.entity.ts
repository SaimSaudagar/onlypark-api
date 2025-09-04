import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Auditable } from '../../common/decorators';

@Entity('patrol_officer')
@Auditable()
export class PatrolOfficer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  officerName: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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
