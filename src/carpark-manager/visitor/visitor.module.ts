import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VisitorController } from "./visitor.controller";
import { VisitorService } from "./visitor.service";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { CarparkManager } from "../entities/carpark-manager.entity";
import { CarparkManagerVisitorSubCarPark } from "../entities/carpark-manager-visitor-sub-car-park.entity";
import { CarparkManagerWhitelistSubCarPark } from "../entities/carpark-manager-whitelist-sub-car-park.entity";
import { CarparkManagerBlacklistSubCarPark } from "../entities/carpark-manager-blacklist-sub-car-park.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VisitorBooking,
      CarparkManager,
      CarparkManagerVisitorSubCarPark,
      CarparkManagerWhitelistSubCarPark,
      CarparkManagerBlacklistSubCarPark,
    ]),
  ],
  controllers: [VisitorController],
  providers: [VisitorService],
  exports: [VisitorService],
})
export class VisitorModule {}
