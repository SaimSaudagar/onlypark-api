import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatrolOfficer } from "./entities/patrol-officer.entity";
import { MasterCarParkModule } from "./master-car-park/master-car-park.module";
import { SubCarParkModule } from "./sub-car-park/sub-car-park.module";
import { BlacklistModule } from "./blacklist/blacklist.module";
import { WhitelistModule } from "./whitelist/whitelist.module";
import { VisitorModule } from "./visitor/visitor.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PatrolOfficer]),
    MasterCarParkModule,
    SubCarParkModule,
    BlacklistModule,
    WhitelistModule,
    VisitorModule,
  ],
})
export class PatrolOfficerModule {}
