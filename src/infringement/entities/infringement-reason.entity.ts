import { Entity, Column, OneToMany } from "typeorm";
import { Infringement } from "./infringement.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("infringement_reason")
@Auditable()
export class InfringementReason extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  reason: string;

  @OneToMany(() => Infringement, (infringement) => infringement.reason)
  infringements: Infringement[];
}
