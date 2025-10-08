import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("whitelist_company")
@Auditable()
export class WhitelistCompany extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  companyName: string;

  @Column({ type: "varchar", nullable: false })
  domainName: string;

  @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.whitelistCompanies)
  @JoinColumn({ name: "subCarParkId" })
  subCarPark: SubCarPark;

  @Column({ type: "varchar", nullable: false })
  subCarParkId: string;
}
