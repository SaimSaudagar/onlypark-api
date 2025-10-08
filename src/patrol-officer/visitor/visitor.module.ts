import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VisitorController } from "./visitor.controller";
import { VisitorService } from "./visitor.service";
import { VisitorBooking } from "../../visitor-booking/entities/visitor-booking.entity";
import { PatrolOfficer } from "../entities/patrol-officer.entity";
import { PatrolOfficerVisitorSubCarPark } from "../entities/patrol-officer-visitor-sub-car-park.entity";
import { PatrolOfficerWhitelistSubCarPark } from "../entities/patrol-officer-whitelist-sub-car-park.entity";
import { PatrolOfficerBlacklistSubCarPark } from "../entities/patrol-officer-blacklist-sub-car-park.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VisitorBooking,
      PatrolOfficer,
      PatrolOfficerVisitorSubCarPark,
      PatrolOfficerWhitelistSubCarPark,
      PatrolOfficerBlacklistSubCarPark,
    ]),
  ],
  controllers: [VisitorController],
  providers: [VisitorService],
  exports: [VisitorService],
})
export class VisitorModule {}
