import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  CarParkType,
  ParkingSpotStatus,
} from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';

@Entity('master_car_park')
@Auditable()
export class MasterCarPark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  carParkName: string;

  @Column({
    type: 'enum',
    enum: CarParkType,
    nullable: false,
  })
  carParkType: CarParkType;

  @Column({ type: 'varchar', unique: true, nullable: false })
  masterCarParkCode: string;

  @Column({
    type: 'enum',
    enum: ParkingSpotStatus,
    default: ParkingSpotStatus.ACTIVE,
  })
  status: ParkingSpotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SubCarPark, (subCarPark) => subCarPark.masterCarPark)
  @JoinColumn({ name: 'subCarParkIds' })
  subCarParks: SubCarPark[];

  @Column({ type: 'varchar', nullable: true })
  subCarParkIds: string[];
}
