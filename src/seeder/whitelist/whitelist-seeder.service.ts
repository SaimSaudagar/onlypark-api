import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Tenancy } from "../../tenancy/entities/tenancy.entity";
import { FileUtils } from "../../common/utils/file.utils";
import { WhitelistStatus } from "../../common/enums";

@Injectable()
export class WhitelistSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Whitelist)
    private readonly whitelistRepository: Repository<Whitelist>,
    @InjectRepository(SubCarPark)
    private readonly subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(Tenancy)
    private readonly tenancyRepository: Repository<Tenancy>
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Whitelist Data seed");
    const whitelists = FileUtils.getDataForSeeding("whitelists");

    let successCount = 0;
    let skipCount = 0;

    for (const whitelistData of whitelists) {
      // Check if whitelist already exists
      const existingWhitelist = await this.whitelistRepository.findOne({
        where: {
          registrationNumber: whitelistData.registrationNumber,
          email: whitelistData.email,
        },
      });

      if (existingWhitelist) {
        this.logger.log(
          `Whitelist ${whitelistData.registrationNumber} for ${whitelistData.email} already exists`
        );
        skipCount++;
        continue;
      }

      // Find the sub car park by code
      const subCarPark = await this.subCarParkRepository.findOne({
        where: { subCarParkCode: whitelistData.subCarParkCode },
      });

      if (!subCarPark) {
        this.logger.warn(
          `SubCarPark with code ${whitelistData.subCarParkCode} not found for Whitelist ${whitelistData.registrationNumber}`
        );
        skipCount++;
        continue;
      }

      // Find tenancy if tenancyId is provided (for now, we'll skip tenancy lookup as we don't have the mapping)
      // In the new system, tenancies should already be seeded
      // We'll find tenancy by subCarPark and email
      let tenancy: Tenancy | null = null;

      if (whitelistData.email) {
        tenancy = await this.tenancyRepository.findOne({
          where: {
            subCarParkId: subCarPark.id,
            tenantEmail: whitelistData.email,
          },
        });
      }

      if (!tenancy) {
        // Try to find any tenancy for this sub car park
        tenancy = await this.tenancyRepository.findOne({
          where: {
            subCarParkId: subCarPark.id,
          },
        });

        if (!tenancy) {
          this.logger.warn(
            `No tenancy found for SubCarPark ${whitelistData.subCarParkCode}. Creating whitelist without tenancy reference.`
          );
          skipCount++;
          continue;
        }
      }

      try {
        const whitelist = this.whitelistRepository.create({
          registrationNumber: whitelistData.registrationNumber,
          comments: whitelistData.comments,
          email: whitelistData.email,
          whitelistType: whitelistData.whitelistType,
          token: whitelistData.token,
          duration: whitelistData.duration || 0,
          startDate: new Date(whitelistData.startDate),
          endDate: new Date(whitelistData.endDate),
          subCarParkId: subCarPark.id,
          tenancyId: tenancy.id,
          status: WhitelistStatus.ACTIVE,
        });

        await this.whitelistRepository.save(whitelist);
        successCount++;

        if (successCount % 100 === 0) {
          this.logger.log(`Seeded ${successCount} whitelists so far...`);
        }
      } catch (error) {
        this.logger.error(
          `Error seeding whitelist ${whitelistData.registrationNumber}: ${error.message}`
        );
        skipCount++;
      }
    }

    this.logger.log(
      `Whitelist seeding completed. Success: ${successCount}, Skipped: ${skipCount}`
    );
  }
}
