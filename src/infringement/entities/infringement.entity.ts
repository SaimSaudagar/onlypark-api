import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { InfringementStatus } from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { InfringementReason } from './infringement-reason.entity';
import { InfringementPenalty } from './infringement-penalty.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Dispute } from './dispute.entity';
import { CarMake } from '../../car-make/entities/car-make.entity';

@Entity('infringements')
@Auditable()
export class Infringement {
  @PrimaryGeneratedColumn('increment')
  ticketNumber: number;

  @Column({ type: 'date', nullable: false })
  ticketDate: Date;

  @Column({ type: 'time', nullable: false })
  ticketTime: string;

  @Column({ type: 'varchar', nullable: false })
  carPark: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'varchar', nullable: false })
  regNo: string;

  @Column({ type: 'varchar', nullable: false })
  carMakeID: string;

  @Column({
    type: 'enum',
    enum: InfringementStatus,
    default: InfringementStatus.PENDING,
  })
  status: InfringementStatus;

  @Column({ type: 'json', nullable: true })
  photos: object;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'date', nullable: false })
  dueDate: Date;

  @Column({ type: 'boolean', default: false })
  sevenDayEmail: boolean;

  @Column({ type: 'boolean', default: false })
  fifteenDayEmail: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;


  @ManyToOne(() => InfringementReason, (reason) => reason.infringements)
  @JoinColumn({ name: 'reasonId' })
  reason: InfringementReason;
  

  @ManyToOne(() => InfringementPenalty, (penalty) => penalty.infringements)
  @JoinColumn({ name: 'penaltyId' })
  penalty: InfringementPenalty;

  @ManyToOne(() => CarMake)
  @JoinColumn({ name: 'carMakeID' })
  carMake: CarMake;

  @OneToMany(() => Dispute, (dispute) => dispute.infringement)
  disputes: Dispute[];
}
