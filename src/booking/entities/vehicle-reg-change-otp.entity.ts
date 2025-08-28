import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('vehicle_reg_change_otps')
export class VehicleRegChangeOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  oldReg: string;

  @Column({ type: 'varchar', nullable: false })
  newReg: string;

  @Column({ type: 'varchar', nullable: false })
  otp: string;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'timestamp', nullable: false })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @ManyToOne(() => Booking, (booking) => booking.vehicleRegChangeOtps)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}

