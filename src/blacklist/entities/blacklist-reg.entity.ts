import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('black_list_reg')
@Auditable()
export class BlacklistReg extends BaseEntity {

  @Column({ type: 'varchar', nullable: false })
  regNo: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  comments: string;

  @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.blacklists)
  @JoinColumn({ name: 'subCarParkId' })
  subCarPark: SubCarPark;

  @Column({ type: 'varchar', nullable: false })
  subCarParkId: string;
}
