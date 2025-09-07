import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { Infringement } from './infringement.entity';
import { Auditable } from '../../common/decorators';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('infringement_penalty')
@Auditable()
export class InfringementPenalty extends BaseEntity {

  @Column({ type: 'varchar', nullable: false })
  penalty: string;

  @Column({ type: 'varchar', nullable: true })
  stripeProductId: string;

  @OneToMany(() => Infringement, (infringement) => infringement.penalty)
  infringements: Infringement[];
}
