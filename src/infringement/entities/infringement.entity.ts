import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
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
  @Column({ type: 'int', generated: 'increment', nullable: false })
  ticketNumber: number;

  @Column({ type: 'timestamptz', nullable: true })
  ticketDate: Date;

  @Column({ type: 'varchar', nullable: true })
  infringementCarParkId: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'varchar', nullable: false })
  registrationNumber: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column({
    type: 'enum',
    enum: InfringementStatus,
    default: InfringementStatus.PENDING,
  })
  status: InfringementStatus;

  @Column({ type: 'varchar', nullable: true })
  carMakeId: string;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', nullable: true })
  penaltyId: string;
  
  @Column({ type: 'varchar', nullable: true })
  reasonId: string;

  @ManyToOne(() => InfringementCarPark, (carPark) => carPark.infringements)
  @JoinColumn({ name: 'infringementCarParkId' })
  infringementCarPark: InfringementCarPark;
  
  @ManyToOne(() => InfringementReason, (reason) => reason.infringements)
  @JoinColumn({ name: 'reasonId' })
  reason: InfringementReason;

  @ManyToOne(() => InfringementPenalty, (penalty) => penalty.infringements)
  @JoinColumn({ name: 'penaltyId' })
  penalty: InfringementPenalty;

  @ManyToOne(() => CarMake)
  @JoinColumn({ name: 'carMakeId' })
  carMake: CarMake;

}
