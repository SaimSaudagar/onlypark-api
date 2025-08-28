import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Infringement } from './infringement.entity';

@Entity('infringement_penalty')
export class InfringementPenalty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  penalty: string;

  @Column({ type: 'varchar', nullable: true })
  stripeProductId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @OneToMany(() => Infringement, (infringement) => infringement.penalty)
  infringements: Infringement[];
}
