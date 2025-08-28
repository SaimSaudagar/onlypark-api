import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';

@Entity('tenancies')
export class Tenancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  tenantName: string;

  @Column({ type: 'text', nullable: false })
  tenantEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @ManyToOne(() => SubCarPark, (carPark) => carPark.tenancies)
  @JoinColumn({ name: 'carParkId' })
  carPark: SubCarPark;

  @OneToMany(() => Whitelist, (whitelist) => whitelist.tenancy)
  whitelists: Whitelist[];
}
