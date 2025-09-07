import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  CarParkType,
  ParkingSpotStatus,
} from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('master_car_park')
@Auditable()
export class MasterCarPark extends BaseEntity {

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

  @OneToMany(() => SubCarPark, (subCarPark) => subCarPark.masterCarPark)
  subCarParks: SubCarPark[];
}
