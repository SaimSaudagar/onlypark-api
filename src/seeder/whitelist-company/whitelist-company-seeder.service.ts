import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WhitelistCompany } from "../../whitelist-company/entities/whitelist-company.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { FileUtils } from "../../common/utils/file.utils";

@Injectable()
export class WhitelistCompanySeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(WhitelistCompany)
    private readonly whitelistCompanyRepository: Repository<WhitelistCompany>,
    @InjectRepository(SubCarPark)
    private readonly subCarParkRepository: Repository<SubCarPark>
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Whitelist Company Data seed");
    const companies = FileUtils.getDataForSeeding("whitelist-companies");

    for (const companyData of companies) {
      const existingCompany = await this.whitelistCompanyRepository.findOne({
        where: {
          companyName: companyData.companyName,
          domainName: companyData.domainName,
        },
      });

      if (!existingCompany) {
        // Find the sub car park by code
        const subCarPark = await this.subCarParkRepository.findOne({
          where: { subCarParkCode: companyData.subCarParkCode },
        });

        if (!subCarPark) {
          this.logger.warn(
            `SubCarPark with code ${companyData.subCarParkCode} not found for Whitelist Company ${companyData.companyName}`
          );
          continue;
        }

        const company = this.whitelistCompanyRepository.create({
          companyName: companyData.companyName,
          domainName: companyData.domainName,
          subCarParkId: subCarPark.id,
        });

        await this.whitelistCompanyRepository.save(company);
        this.logger.log(
          `Whitelist Company ${companyData.companyName} (@${companyData.domainName}) seeded for SubCarPark ${companyData.subCarParkCode}`
        );
      } else {
        this.logger.log(
          `Whitelist Company ${companyData.companyName} (@${companyData.domainName}) already exists`
        );
      }
    }
  }
}
