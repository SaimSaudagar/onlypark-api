import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";

@Entity("black_list")
@Auditable()
export class Blacklist extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  registrationNumber: string;

  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: true })
  comments: string;

  @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.blacklists)
  @JoinColumn({ name: "subCarParkId" })
  subCarPark: SubCarPark;

  @Column({ type: "varchar", nullable: false })
  subCarParkId: string;
}
