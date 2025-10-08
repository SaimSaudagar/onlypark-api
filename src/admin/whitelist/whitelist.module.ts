import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WhitelistController } from "./whitelist.controller";
import { WhitelistService } from "./whitelist.service";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { SubCarParkModule } from "../sub-car-park/sub-car-park.module";
import { TenancyModule } from "../../tenancy/tenancy.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Whitelist]),
    SubCarParkModule,
    TenancyModule,
  ],
  controllers: [WhitelistController],
  providers: [WhitelistService],
  exports: [WhitelistService],
})
export class WhitelistModule {}
