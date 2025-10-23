import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatrolOfficerDashboardController } from "./dashboard.controller";
import { PatrolOfficerDashboardService } from "./dashboard.service";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { Infringement } from "../../infringement/entities/infringement.entity";
import { Dispute } from "../../dispute/entities/dispute.entity";
import { PatrolOfficerVisitorSubCarPark } from "../entities/patrol-officer-visitor-sub-car-park.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VisitorBooking,
      Whitelist,
      Infringement,
      Dispute,
      PatrolOfficerVisitorSubCarPark,
    ]),
  ],
  controllers: [PatrolOfficerDashboardController],
  providers: [PatrolOfficerDashboardService],
  exports: [PatrolOfficerDashboardService],
})
export class PatrolOfficerDashboardModule {}
