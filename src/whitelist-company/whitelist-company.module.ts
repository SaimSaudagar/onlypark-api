import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WhitelistCompanyController } from "./whitelist-company.controller";
import { WhitelistCompanyService } from "./whitelist-company.service";
import { WhitelistCompany } from "./entities/whitelist-company.entity";

@Module({
  imports: [TypeOrmModule.forFeature([WhitelistCompany])],
  controllers: [WhitelistCompanyController],
  providers: [WhitelistCompanyService],
  exports: [WhitelistCompanyService],
})
export class WhitelistCompanyModule {}
