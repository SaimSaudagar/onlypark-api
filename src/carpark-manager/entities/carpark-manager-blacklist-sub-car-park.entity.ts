import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { CarparkManager } from "./carpark-manager.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("carpark_manager_blacklist_assigned_sub_car_park")
@Auditable()
export class CarparkManagerBlacklistSubCarPark extends BaseEntity {
  @ManyToOne(
    () => CarparkManager,
    (carparkManager) => carparkManager.carparkManagerBlacklistSubCarParks,
  )
  @JoinColumn({ name: "carparkManagerId" })
  carparkManager: CarparkManager;

  @Column({ type: "varchar", nullable: false })
  carparkManagerId: string;

  @ManyToOne(
    () => SubCarPark,
    (subCarPark) => subCarPark.carparkManagerBlacklistSubCarParks,
  )
  @JoinColumn({ name: "subCarParkId" })
  subCarPark: SubCarPark;

  @Column({ type: "varchar", nullable: false })
  subCarParkId: string;
}
