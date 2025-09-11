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
import { BaseEntity } from '../../common/entities/base.entity';
import { CarparkManager } from '../../carpark-manager/entities/carpark-manager.entity';

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
  bookings: Booking[];

  @OneToMany(() => Tenancy, (tenancy) => tenancy.subCarPark)
  tenancies: Tenancy[];

  @OneToMany(() => Whitelist, (whitelist) => whitelist.subCarPark)
  whitelists: Whitelist[];

  @OneToMany(() => WhitelistCompany, (whitelistCompany) => whitelistCompany.subCarPark)
  whitelistCompanies: WhitelistCompany[];

  @OneToMany(() => BlacklistReg, (blacklist) => blacklist.subCarPark)
  blacklists: BlacklistReg[];

  @OneToMany(() => PatrolOfficer, (officer) => officer.subCarParks)
  patrolOfficers: PatrolOfficer[];

  @ManyToOne(() => CarparkManager, (carparkManager) => carparkManager.subCarParks)
  @JoinColumn({ name: 'carparkManagerId' })
  carparkManager: CarparkManager;

  @Column({ type: 'varchar', nullable: false })
  carparkManagerId: string;
}
