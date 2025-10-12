import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatrolOfficer } from "./entities/patrol-officer.entity";
import { MasterCarParkModule } from "./master-car-park/master-car-park.module";
import { SubCarParkModule } from "./sub-car-park/sub-car-park.module";
import { BlacklistModule } from "./blacklist/blacklist.module";
import { WhitelistModule } from "./whitelist/whitelist.module";
import { VisitorModule } from "./visitor/visitor.module";
import { InfringementModule } from "./infringement/infringement.module";
import { DisputeModule } from "./dispute/dispute.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PatrolOfficer]),
    MasterCarParkModule,
    SubCarParkModule,
    BlacklistModule,
    WhitelistModule,
    VisitorModule,
    InfringementModule,
    DisputeModule,
  ],
})
export class PatrolOfficerModule {}
