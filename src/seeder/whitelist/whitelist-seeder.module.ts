import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Tenancy } from "../../tenancy/entities/tenancy.entity";
import { WhitelistSeederService } from "./whitelist-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist, SubCarPark, Tenancy])],
  providers: [WhitelistSeederService],
  exports: [WhitelistSeederService],
})
export class WhitelistSeederModule {}
