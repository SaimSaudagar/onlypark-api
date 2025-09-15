import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Infringement } from './infringement.entity';
import { InfringementCarPark } from './infringement-car-park.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('infringement_penalty')
@Auditable()
export class InfringementPenalty extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  infringementCarParkId: string;

  @ManyToOne(() => InfringementCarPark, (carPark) => carPark.infringements)
  @JoinColumn({ name: 'infringementCarParkId' })
  infringementCarPark: InfringementCarPark;

  @Column({ type: 'varchar', nullable: false })
  penaltyName: string;

  @Column({ type: 'varchar', nullable: true })
  stripePriceIdBeforeDue: string;

  @Column({ type: 'varchar', nullable: true })
  stripePriceIdAfterDue: string;

  @Column({ type: 'decimal', nullable: false })
  amountBeforeDue: number;

  @Column({ type: 'decimal', nullable: false })
  amountAfterDue: number;

  @OneToMany(() => Infringement, (infringement) => infringement.penalty)
  infringements: Infringement[];
}
