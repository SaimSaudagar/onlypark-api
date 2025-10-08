import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Auditable } from "../../common/decorators";
import { Tenancy } from "../../tenancy/entities/tenancy.entity";
import { BaseEntity } from "../../common/entities/base.entity";
import { VisitorBookingStatus } from "../../common/enums";

@Entity("visitor_bookings")
@Auditable()
export class VisitorBooking extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: false })
  registrationNumber: string;

  @Column({ type: "varchar", nullable: false })
  tenancyId: string;

  @ManyToOne(() => Tenancy)
  @JoinColumn({ name: "tenancyId" })
  tenancy: Tenancy;

  @Column({
    type: "timestamptz",
    nullable: false,
  })
  startDate: Date;

  @Column({
    type: "timestamptz",
    nullable: false,
  })
  endDate: Date;

  @Column({ type: "varchar", default: VisitorBookingStatus.ACTIVE })
  status: VisitorBookingStatus;

  @Column({ type: "varchar", nullable: false })
  subCarParkId: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  token: string;

  @ManyToOne(() => SubCarPark)
  @JoinColumn({ name: "subCarParkId" })
  subCarPark: SubCarPark;
}
