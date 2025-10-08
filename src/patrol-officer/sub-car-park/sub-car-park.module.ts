import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubCarParkController } from "./sub-car-park.controller";
import { SubCarParkService } from "./sub-car-park.service";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { PatrolOfficer } from "../entities/patrol-officer.entity";
import { PatrolOfficerVisitorSubCarPark } from "../entities/patrol-officer-visitor-sub-car-park.entity";
import { PatrolOfficerWhitelistSubCarPark } from "../entities/patrol-officer-whitelist-sub-car-park.entity";
import { PatrolOfficerBlacklistSubCarPark } from "../entities/patrol-officer-blacklist-sub-car-park.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubCarPark,
      PatrolOfficer,
      PatrolOfficerVisitorSubCarPark,
      PatrolOfficerWhitelistSubCarPark,
      PatrolOfficerBlacklistSubCarPark,
    ]),
  ],
  controllers: [SubCarParkController],
  providers: [SubCarParkService],
  exports: [SubCarParkService],
})
export class SubCarParkModule {}
