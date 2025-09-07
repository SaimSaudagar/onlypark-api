import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  ParkingSpotStatus,
} from '../../common/enums';
import { Auditable } from '../../common/decorators';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';
import { WhitelistCompany } from '../../whitelist-company/entities/whitelist-company.entity';
import { BlacklistReg } from '../../blacklist/entities/blacklist-reg.entity';
import { PatrolOfficer } from '../../patrol-officer/entities/patrol-officer.entity';
import { Infringement } from '../../infringement/entities/infringement.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('sub_car_park')
@Auditable()
export class SubCarPark extends BaseEntity {

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

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  subCarParkCode: string;

  @Column({ type: 'int', nullable: true })
  freeHours: number;

  @Column({ type: 'int', nullable: true })
  noOfPermitsPerRegNo: number;

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

  @ManyToOne(() => MasterCarPark, (masterCarPark) => masterCarPark.subCarParks)
  @JoinColumn({ name: 'masterCarParkId' })
  masterCarPark: MasterCarPark;

  @Column({ type: 'varchar', nullable: false })
  masterCarParkId: string;

  @OneToMany(() => Booking, (booking) => booking.subCarPark)
  @JoinColumn({ name: 'bookingIds' })
  bookings: Booking[];

  @Column({ type: 'varchar', nullable: true })
  bookingIds: string[];

  @OneToMany(() => Tenancy, (tenancy) => tenancy.subCarPark)
  @JoinColumn({ name: 'tenancyIds' })
  tenancies: Tenancy[];

  @Column({ type: 'varchar', nullable: true })
  tenancyIds: string[];

  @OneToMany(() => Whitelist, (whitelist) => whitelist.subCarPark)
  @JoinColumn({ name: 'whitelistIds' })
  whitelists: Whitelist[];

  @Column({ type: 'varchar', nullable: true })
  whitelistIds: string[];

  @OneToMany(() => WhitelistCompany, (whitelistCompany) => whitelistCompany.subCarPark)
  @JoinColumn({ name: 'whitelistCompanyIds' })
  whitelistCompanies: WhitelistCompany[];

  @Column({ type: 'varchar', nullable: true })
  whitelistCompanyIds: string[];

  @OneToMany(() => BlacklistReg, (blacklist) => blacklist.subCarPark)
  @JoinColumn({ name: 'blacklistIds' })
  blacklists: BlacklistReg[];

  @Column({ type: 'varchar', nullable: true })
  blacklistIds: string[];

  @OneToMany(() => PatrolOfficer, (officer) => officer.subCarParks)
  @JoinColumn({ name: 'patrolOfficerIds' })
  patrolOfficers: PatrolOfficer[];

  @Column({ type: 'varchar', nullable: true })
  patrolOfficerIds: string[];
}
