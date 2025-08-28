import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
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

  @Column({ type: 'int', nullable: false })
  totalCarSpace: number;

  @Column({
    type: 'enum',
    enum: CarParkType,
    nullable: false,
  })
  carParkType: CarParkType;

  @Column({ type: 'varchar', nullable: false })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: false })
  lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: false })
  lang: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  carParkCode: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  slug: string;

  @Column({ type: 'int', nullable: false })
  operatingHours: number;

  @Column({ type: 'boolean', default: false })
  tenantEmailCheck: boolean;

  @Column({ type: 'boolean', default: false })
  geolocation: boolean;

  @Column({ type: 'boolean', default: false })
  event: boolean;

  @Column({ type: 'timestamp', nullable: true })
  eventDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  eventExpiryDate: Date;

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
  subCarParks: SubCarPark[];
}
