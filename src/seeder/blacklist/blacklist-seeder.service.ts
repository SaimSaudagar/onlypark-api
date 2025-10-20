import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Blacklist } from "../../blacklist/entities/blacklist-reg.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { FileUtils } from "../../common/utils/file.utils";

@Injectable()
export class BlacklistSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,
    @InjectRepository(SubCarPark)
    private readonly subCarParkRepository: Repository<SubCarPark>
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Blacklist Data seed");
    const blacklists = FileUtils.getDataForSeeding("blacklists");

    let successCount = 0;
    let skipCount = 0;

    for (const blacklistData of blacklists) {
      // Check if blacklist already exists
      const existingBlacklist = await this.blacklistRepository.findOne({
        where: {
          registrationNumber: blacklistData.registrationNumber,
          email: blacklistData.email,
        },
      });

      if (existingBlacklist) {
        this.logger.log(
          `Blacklist ${blacklistData.registrationNumber} for ${blacklistData.email} already exists`
        );
        skipCount++;
        continue;
      }

      // Find the sub car park by code
      const subCarPark = await this.subCarParkRepository.findOne({
        where: { subCarParkCode: blacklistData.subCarParkCode },
      });

      if (!subCarPark) {
        this.logger.warn(
          `SubCarPark with code ${blacklistData.subCarParkCode} not found for Blacklist ${blacklistData.registrationNumber}`
        );
        skipCount++;
        continue;
      }

      try {
        const blacklist = this.blacklistRepository.create({
          registrationNumber: blacklistData.registrationNumber,
          email: blacklistData.email,
          comments: blacklistData.comments,
          subCarParkId: subCarPark.id,
        });

        await this.blacklistRepository.save(blacklist);
        successCount++;

        if (successCount % 100 === 0) {
          this.logger.log(`Seeded ${successCount} blacklists so far...`);
        }
      } catch (error) {
        this.logger.error(
          `Error seeding blacklist ${blacklistData.registrationNumber}: ${error.message}`
        );
        skipCount++;
      }
    }

    this.logger.log(
      `Blacklist seeding completed. Success: ${successCount}, Skipped: ${skipCount}`
    );
  }
}
