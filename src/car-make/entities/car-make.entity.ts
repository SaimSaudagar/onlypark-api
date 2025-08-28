import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Infringement } from '../../infringement/entities/infringement.entity';
import { Auditable } from '../../common';

@Entity('car_make')
@Auditable()
export class CarMake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Infringement, (infringement) => infringement.carMake)
  infringements: Infringement[];
}
