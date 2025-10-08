import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenancy } from "../../tenancy/entities/tenancy.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { FileUtils } from "../../common/utils/file.utils";

@Injectable()
export class TenancySeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Tenancy)
    private readonly tenancyRepository: Repository<Tenancy>,
    @InjectRepository(SubCarPark)
    private readonly subCarParkRepository: Repository<SubCarPark>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Tenancy Data seed");
    const tenancies = FileUtils.getDataForSeeding("tenancies");

    for (const tenancyData of tenancies) {
      const existingTenancy = await this.tenancyRepository.findOne({
        where: {
          tenantEmail: tenancyData.tenantEmail,
          tenantName: tenancyData.tenantName,
        },
      });

      if (!existingTenancy) {
        // Find the sub car park by code
        const subCarPark = await this.subCarParkRepository.findOne({
          where: { subCarParkCode: tenancyData.subCarParkCode },
        });

        if (!subCarPark) {
          this.logger.warn(
            `SubCarPark with code ${tenancyData.subCarParkCode} not found for Tenancy ${tenancyData.tenantName}`,
          );
          continue;
        }

        const tenancy = this.tenancyRepository.create({
          tenantName: tenancyData.tenantName,
          tenantEmail: tenancyData.tenantEmail,
          subCarParkId: subCarPark.id,
        });

        await this.tenancyRepository.save(tenancy);
        this.logger.log(
          `Tenancy ${tenancyData.tenantName} seeded for SubCarPark ${tenancyData.subCarParkCode}`,
        );
      } else {
        this.logger.log(`Tenancy ${tenancyData.tenantName} already exists`);
      }
    }
  }
}
