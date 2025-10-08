import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { PatrolOfficer } from "./patrol-officer.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("patrol_officer_whitelist_assigned_sub_car_park")
@Auditable()
export class PatrolOfficerWhitelistSubCarPark extends BaseEntity {
  @ManyToOne(
    () => PatrolOfficer,
    (patrolOfficer) => patrolOfficer.patrolOfficerWhitelistSubCarParks,
  )
  @JoinColumn({ name: "patrolOfficerId" })
  patrolOfficer: PatrolOfficer;

  @Column({ type: "varchar", nullable: false })
  patrolOfficerId: string;

  @ManyToOne(
    () => SubCarPark,
    (subCarPark) => subCarPark.patrolOfficerWhitelistSubCarParks,
  )
  @JoinColumn({ name: "subCarParkId" })
  subCarPark: SubCarPark;

  @Column({ type: "varchar", nullable: false })
  subCarParkId: string;
}
