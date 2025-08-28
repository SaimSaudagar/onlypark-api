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

@Entity('black_list_reg')
export class BlacklistReg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  regNo: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  comments: string;

  @Column({ type: 'varchar', nullable: false })
  subCarParkCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @ManyToOne(() => SubCarPark, (parkingSpot) => parkingSpot.blacklists)
  @JoinColumn({ name: 'subCarParkCode', referencedColumnName: 'carParkCode' })
  parkingSpot: SubCarPark;
}
