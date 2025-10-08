import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { WhitelistCompany } from "../../whitelist-company/entities/whitelist-company.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("tenancies")
@Auditable()
export class Tenancy extends BaseEntity {
  @Column({ type: "text", nullable: false })
  tenantName: string;

  @Column({ type: "text", nullable: false })
  tenantEmail: string;

  @ManyToOne(() => SubCarPark, (subCarPark) => subCarPark.tenancies)
  @JoinColumn({ name: "subCarParkId" })
  subCarPark: SubCarPark;

  @Column({ type: "varchar", nullable: false })
  subCarParkId: string;

  @OneToMany(() => Whitelist, (whitelist) => whitelist.tenancy)
  whitelists: Whitelist[];
}
