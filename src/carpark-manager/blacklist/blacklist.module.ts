import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlacklistController } from "./blacklist.controller";
import { BlacklistService } from "./blacklist.service";
import { Blacklist } from "../../blacklist/entities/blacklist-reg.entity";
import { CarparkManager } from "../entities/carpark-manager.entity";
import { CarparkManagerVisitorSubCarPark } from "../entities/carpark-manager-visitor-sub-car-park.entity";
import { CarparkManagerWhitelistSubCarPark } from "../entities/carpark-manager-whitelist-sub-car-park.entity";
import { CarparkManagerBlacklistSubCarPark } from "../entities/carpark-manager-blacklist-sub-car-park.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Blacklist,
      CarparkManager,
      CarparkManagerVisitorSubCarPark,
      CarparkManagerWhitelistSubCarPark,
      CarparkManagerBlacklistSubCarPark,
    ]),
  ],
  controllers: [BlacklistController],
  providers: [BlacklistService],
  exports: [BlacklistService],
})
export class BlacklistModule {}
