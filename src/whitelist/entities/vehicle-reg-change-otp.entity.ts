import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Whitelist } from "./whitelist.entity";
import { Auditable } from "../../common/decorators";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("vehicle_reg_change_otps")
@Auditable()
export class VehicleRegChangeOtp extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: false })
  oldReg: string;

  @Column({ type: "varchar", nullable: false })
  newReg: string;

  @Column({ type: "varchar", nullable: false })
  otp: string;

  @Column({ type: "boolean", default: false })
  status: boolean;

  @Column({ type: "timestamp", nullable: false })
  expiresAt: Date;

  @ManyToOne(() => Whitelist, (whitelist) => whitelist.vehicleRegChangeOtps)
  @JoinColumn({ name: "whitelistId" })
  whitelist: Whitelist;

  @Column({ type: "varchar", nullable: false })
  whitelistId: string;
}
