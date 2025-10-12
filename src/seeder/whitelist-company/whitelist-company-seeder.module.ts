import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WhitelistCompany } from "../../whitelist-company/entities/whitelist-company.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { WhitelistCompanySeederService } from "./whitelist-company-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([WhitelistCompany, SubCarPark])],
  providers: [WhitelistCompanySeederService],
  exports: [WhitelistCompanySeederService],
})
export class WhitelistCompanySeederModule {}
