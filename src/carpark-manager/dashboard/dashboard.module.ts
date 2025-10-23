import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarparkManagerDashboardController } from "./dashboard.controller";
import { CarparkManagerDashboardService } from "./dashboard.service";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { Infringement } from "../../infringement/entities/infringement.entity";
import { Dispute } from "../../dispute/entities/dispute.entity";
import { CarparkManagerVisitorSubCarPark } from "../entities/carpark-manager-visitor-sub-car-park.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VisitorBooking,
      Whitelist,
      Infringement,
      Dispute,
      CarparkManagerVisitorSubCarPark,
    ]),
  ],
  controllers: [CarparkManagerDashboardController],
  providers: [CarparkManagerDashboardService],
  exports: [CarparkManagerDashboardService],
})
export class CarparkManagerDashboardModule {}
