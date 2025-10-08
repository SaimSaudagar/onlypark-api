import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { ParkingSpotStatus } from "../../common/enums";
import { Auditable } from "../../common/decorators";
import { MasterCarPark } from "../../master-car-park/entities/master-car-park.entity";
import { VisitorBooking } from "../../visitor-booking/entities/visitor-booking.entity";
import { Tenancy } from "../../tenancy/entities/tenancy.entity";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { WhitelistCompany } from "../../whitelist-company/entities/whitelist-company.entity";
import { PatrolOfficerVisitorSubCarPark } from "../../patrol-officer/entities/patrol-officer-visitor-sub-car-park.entity";
import { PatrolOfficerWhitelistSubCarPark } from "../../patrol-officer/entities/patrol-officer-whitelist-sub-car-park.entity";
import { PatrolOfficerBlacklistSubCarPark } from "../../patrol-officer/entities/patrol-officer-blacklist-sub-car-park.entity";
import { CarparkManagerVisitorSubCarPark } from "../../carpark-manager/entities/carpark-manager-visitor-sub-car-park.entity";
import { CarparkManagerWhitelistSubCarPark } from "../../carpark-manager/entities/carpark-manager-whitelist-sub-car-park.entity";
import { CarparkManagerBlacklistSubCarPark } from "../../carpark-manager/entities/carpark-manager-blacklist-sub-car-park.entity";
import { BaseEntity } from "../../common/entities/base.entity";
import { CarparkManager } from "../../carpark-manager/entities/carpark-manager.entity";
import { Blacklist } from "../../blacklist/entities/blacklist-reg.entity";

@Entity("sub_car_park")
@Auditable()
export class SubCarPark extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  carParkName: string;

  @Column({ type: "int", nullable: false })
  carSpace: number;

  @Column({ type: "varchar", nullable: false })
  location: string;

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: false })
  lat: number;

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: false })
  lang: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  subCarParkCode: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  freeHours: number;

  @Column({ type: "int", nullable: true })
  noOfPermitsPerRegNo: number;

  @Column({ type: "boolean", default: false })
  tenantEmailCheck: boolean;

  @Column({ type: "boolean", default: false })
  geolocation: boolean;

  @Column({ type: "boolean", default: false })
  event: boolean;

  @Column({ type: "timestamp", nullable: true })
  eventDate: Date;

  @Column({ type: "timestamp", nullable: true })
  eventExpiryDate: Date;

  @Column({
    type: "enum",
    enum: ParkingSpotStatus,
    default: ParkingSpotStatus.ACTIVE,
  })
  status: ParkingSpotStatus;

  @ManyToOne(() => MasterCarPark, (masterCarPark) => masterCarPark.subCarParks)
  @JoinColumn({ name: "masterCarParkId" })
  masterCarPark: MasterCarPark;

  @Column({ type: "varchar", nullable: false })
  masterCarParkId: string;

  @OneToMany(
    () => VisitorBooking,
    (visitorBooking) => visitorBooking.subCarPark,
  )
  visitorBookings: VisitorBooking[];

  @OneToMany(() => Tenancy, (tenancy) => tenancy.subCarPark)
  tenancies: Tenancy[];

  @OneToMany(() => Whitelist, (whitelist) => whitelist.subCarPark)
  whitelists: Whitelist[];

  @OneToMany(
    () => WhitelistCompany,
    (whitelistCompany) => whitelistCompany.subCarPark,
  )
  whitelistCompanies: WhitelistCompany[];

  @OneToMany(() => Blacklist, (blacklist) => blacklist.subCarPark)
  blacklists: Blacklist[];

  @OneToMany(
    () => PatrolOfficerVisitorSubCarPark,
    (patrolOfficerVisitorSubCarPark) =>
      patrolOfficerVisitorSubCarPark.subCarPark,
  )
  patrolOfficerVisitorSubCarParks: PatrolOfficerVisitorSubCarPark[];

  @OneToMany(
    () => PatrolOfficerWhitelistSubCarPark,
    (patrolOfficerWhitelistSubCarPark) =>
      patrolOfficerWhitelistSubCarPark.subCarPark,
  )
  patrolOfficerWhitelistSubCarParks: PatrolOfficerWhitelistSubCarPark[];

  @OneToMany(
    () => PatrolOfficerBlacklistSubCarPark,
    (patrolOfficerBlacklistSubCarPark) =>
      patrolOfficerBlacklistSubCarPark.subCarPark,
  )
  patrolOfficerBlacklistSubCarParks: PatrolOfficerBlacklistSubCarPark[];

  @OneToMany(
    () => CarparkManagerVisitorSubCarPark,
    (carparkManagerVisitorSubCarPark) =>
      carparkManagerVisitorSubCarPark.subCarPark,
  )
  carparkManagerVisitorSubCarParks: CarparkManagerVisitorSubCarPark[];

  @OneToMany(
    () => CarparkManagerWhitelistSubCarPark,
    (carparkManagerWhitelistSubCarPark) =>
      carparkManagerWhitelistSubCarPark.subCarPark,
  )
  carparkManagerWhitelistSubCarParks: CarparkManagerWhitelistSubCarPark[];

  @OneToMany(
    () => CarparkManagerBlacklistSubCarPark,
    (carparkManagerBlacklistSubCarPark) =>
      carparkManagerBlacklistSubCarPark.subCarPark,
  )
  carparkManagerBlacklistSubCarParks: CarparkManagerBlacklistSubCarPark[];
}
