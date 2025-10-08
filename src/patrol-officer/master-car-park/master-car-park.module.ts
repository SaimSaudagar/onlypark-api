import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MasterCarParkController } from "./master-car-park.controller";
import { MasterCarParkService } from "./master-car-park.service";
import { MasterCarPark } from "../../master-car-park/entities/master-car-park.entity";
import { PatrolOfficer } from "../entities/patrol-officer.entity";
import { PatrolOfficerVisitorSubCarPark } from "../entities/patrol-officer-visitor-sub-car-park.entity";
import { PatrolOfficerWhitelistSubCarPark } from "../entities/patrol-officer-whitelist-sub-car-park.entity";
import { PatrolOfficerBlacklistSubCarPark } from "../entities/patrol-officer-blacklist-sub-car-park.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasterCarPark,
      PatrolOfficer,
      PatrolOfficerVisitorSubCarPark,
      PatrolOfficerWhitelistSubCarPark,
      PatrolOfficerBlacklistSubCarPark,
    ]),
  ],
  controllers: [MasterCarParkController],
  providers: [MasterCarParkService],
  exports: [MasterCarParkService],
})
export class MasterCarParkModule {}
