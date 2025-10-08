import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlacklistController } from "./blacklist.controller";
import { BlacklistService } from "./blacklist.service";
import { Blacklist } from "../../blacklist/entities/blacklist-reg.entity";
import { SubCarParkModule } from "../sub-car-park/sub-car-park.module";

@Module({
  imports: [TypeOrmModule.forFeature([Blacklist]), SubCarParkModule],
  controllers: [BlacklistController],
  providers: [BlacklistService],
  exports: [BlacklistService],
})
export class BlacklistModule {}
