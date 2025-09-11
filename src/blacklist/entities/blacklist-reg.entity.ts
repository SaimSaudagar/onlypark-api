import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';

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

  @ManyToOne(() => MasterCarPark, (masterCarPark) => masterCarPark.blacklists)
  @JoinColumn({ name: 'masterCarParkId' })
  masterCarPark: MasterCarPark;

  @Column({ type: 'varchar', nullable: false })
  masterCarParkId: string;
}
