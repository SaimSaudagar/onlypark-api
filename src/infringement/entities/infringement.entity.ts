import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { InfringementStatus } from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { InfringementReason } from './infringement-reason.entity';
import { InfringementPenalty } from './infringement-penalty.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { CarMake } from '../../car-make/entities/car-make.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { InfringementCarPark } from './infringement-car-park.entity';

@Entity('infringements')
@Auditable()
export class Infringement extends BaseEntity {
  @Column({ type: 'int', generated: 'increment', nullable: true })
  ticketNumber: number;

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  ticketDate: Date;

  @Column({ type: 'varchar', nullable: true })
  infringementCarParkId: string;

  @ManyToOne(() => InfringementCarPark, (carPark) => carPark.infringements)
  @JoinColumn({ name: 'infringementCarParkId' })
  infringementCarPark: InfringementCarPark;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'varchar', nullable: false })
  registrationNo: string;

  @Column({ type: 'json', nullable: true })
  photos: object;

  @Column({
    type: 'enum',
    enum: InfringementStatus,
    default: InfringementStatus.PENDING,
  })
  status: InfringementStatus;

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  dueDate: Date;

  @ManyToOne(() => InfringementReason, (reason) => reason.infringements)
  @JoinColumn({ name: 'reasonId' })
  reason: InfringementReason;

  @Column({ type: 'varchar', nullable: true })
  reasonId: string;

  @ManyToOne(() => InfringementPenalty, (penalty) => penalty.infringements)
  @JoinColumn({ name: 'penaltyId' })
  penalty: InfringementPenalty;

  @Column({ type: 'varchar', nullable: true })
  penaltyId: string;

  @ManyToOne(() => CarMake)
  @JoinColumn({ name: 'carMakeId' })
  carMake: CarMake;

  @Column({ type: 'varchar', nullable: true })
  carMakeId: string;

}
