import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Infringement } from './infringement.entity';
import { Auditable } from '../../common/decorators';

@Entity('infringement_reason')
@Auditable()
export class InfringementReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @OneToMany(() => Infringement, (infringement) => infringement.reason)
  infringements: Infringement[];
}
