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
import { VehicleRegChangeOtp } from './vehicle-reg-change-otp.entity';
import { Auditable } from '../../common/decorators';

@Entity('bookings')
@Auditable()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  vehicleReg: string;

  @Column({ type: 'varchar', nullable: false })
  subCarParkCode: string;

  @Column({ type: 'varchar', nullable: false })
  property: string;

  @Column({ type: 'varchar', nullable: false })
  startTime: string;

  @Column({ type: 'varchar', nullable: false })
  endTime: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @ManyToOne(() => SubCarPark)
  @JoinColumn({ name: 'subCarParkCode', referencedColumnName: 'carParkCode' })
  parkingSpot: SubCarPark;

  @OneToMany(() => VehicleRegChangeOtp, (otp) => otp.booking)
  vehicleRegChangeOtps: VehicleRegChangeOtp[];
}

