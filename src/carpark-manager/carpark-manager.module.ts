import { Module } from "@nestjs/common";
import { MasterCarParkModule } from "./master-car-park/master-car-park.module";
import { SubCarParkModule } from "./sub-car-park/sub-car-park.module";
import { BlacklistModule } from "./blacklist/blacklist.module";
import { WhitelistModule } from "./whitelist/whitelist.module";
import { VisitorModule } from "./visitor/visitor.module";

@Module({
  imports: [
    MasterCarParkModule,
    SubCarParkModule,
    BlacklistModule,
    WhitelistModule,
    VisitorModule,
  ],
})
export class CarparkManagerModule {}
