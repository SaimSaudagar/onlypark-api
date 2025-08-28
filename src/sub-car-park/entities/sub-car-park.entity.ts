import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  SpotType,
  ParkingSpotStatus,
} from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';
import { BlacklistReg } from '../../blacklist/entities/blacklist-reg.entity';
import { PatrolOfficer } from '../../patrol-officer/entities/patrol-officer.entity';
import { Infringement } from '../../infringement/entities/infringement.entity';

@Entity('sub_car_park')
@Auditable()
export class SubCarPark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  carParkName: string;

  @Column({ type: 'int', nullable: false })
  carSpace: number;

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
  hours: number;

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
    enum: SpotType,
    nullable: false,
  })
  spotType: SpotType;

  @Column({
    type: 'enum',
    enum: ParkingSpotStatus,
    default: ParkingSpotStatus.ACTIVE,
  })
  status: ParkingSpotStatus;

  @Column({ type: 'uuid', nullable: false })
  masterCarParkId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => MasterCarPark, (masterCarPark) => masterCarPark.subCarParks)
  @JoinColumn({ name: 'masterCarParkId' })
  masterCarPark: MasterCarPark;

  @OneToMany(() => Booking, (booking) => booking.parkingSpot)
  bookings: Booking[];

  @OneToMany(() => Tenancy, (tenancy) => tenancy.carPark)
  tenancies: Tenancy[];

  @OneToMany(() => Whitelist, (whitelist) => whitelist.carPark)
  whitelists: Whitelist[];

  @OneToMany(() => BlacklistReg, (blacklist) => blacklist.parkingSpot)
  blacklists: BlacklistReg[];

  @OneToMany(() => PatrolOfficer, (officer) => officer.spot)
  patrolOfficers: PatrolOfficer[];

  @OneToMany(() => Infringement, (infringement) => infringement.parkingSpot)
  infringements: Infringement[];
}
