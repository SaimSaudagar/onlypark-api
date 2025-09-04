import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { Auditable } from '../../common/decorators';

@Entity('whitelist')
@Auditable()
export class Whitelist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  vehicalRegistration: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.whitelists)
  @JoinColumn({ name: 'subCarParkId' })
  subCarPark: SubCarPark;

  @Column({ type: 'varchar', nullable: false })
  subCarParkId: string;

  @ManyToOne(() => Tenancy, (tenancy) => tenancy.whitelists)
  @JoinColumn({ name: 'tenancyId' })
  tenancy: Tenancy;

  @Column({ type: 'varchar', nullable: false })
  tenancyId: string;
}
