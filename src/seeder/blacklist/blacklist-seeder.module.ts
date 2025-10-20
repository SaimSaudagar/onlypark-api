import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Blacklist } from "../../blacklist/entities/blacklist-reg.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { BlacklistSeederService } from "./blacklist-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([Blacklist, SubCarPark])],
  providers: [BlacklistSeederService],
  exports: [BlacklistSeederService],
})
export class BlacklistSeederModule {}
