import { Entity, Column } from "typeorm";
import { Auditable } from "../../common";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("car_make")
@Auditable()
export class CarMake extends BaseEntity {
  @Column({ type: "varchar", unique: true, nullable: false })
  carMakeName: string;
}
