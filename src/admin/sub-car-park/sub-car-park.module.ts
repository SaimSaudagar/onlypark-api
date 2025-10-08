import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubCarParkController } from "./sub-car-park.controller";
import { SubCarParkService } from "./sub-car-park.service";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { MasterCarParkModule } from "../master-car-park/master-car-park.module";
import { TenancyModule } from "../../tenancy/tenancy.module";
import { WhitelistCompanyModule } from "../../whitelist-company/whitelist-company.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SubCarPark]),
    MasterCarParkModule,
    TenancyModule,
    WhitelistCompanyModule,
  ],
  controllers: [SubCarParkController],
  providers: [SubCarParkService],
  exports: [SubCarParkService],
})
export class SubCarParkModule {}
