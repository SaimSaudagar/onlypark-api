import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InfringementPenalty } from "../../infringement/entities/infringement-penalty.entity";
import { InfringementCarPark } from "../../infringement/entities/infringement-car-park.entity";
import { FileUtils } from "../../common/utils/file.utils";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";

@Injectable()
export class InfringementPenaltySeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(InfringementPenalty)
    private readonly infringementPenaltyRepository: Repository<InfringementPenalty>,
    @InjectRepository(InfringementCarPark)
    private readonly infringementCarParkRepository: Repository<InfringementCarPark>
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Infringement Penalty Data seed");
    const infringementPenalties = FileUtils.getDataForSeeding(
      "infringement-penalties"
    );

    for (const penaltyData of infringementPenalties) {
      try {
        // Check if infringement car park exists
        const infringementCarPark =
          await this.infringementCarParkRepository.findOne({
            where: { carParkName: penaltyData.carParkName },
          });

        if (!infringementCarPark) {
          this.logger.warn(
            `Infringement car park ${penaltyData.carParkName} not found. Skipping penalty ${penaltyData.penaltyName}`
          );
          continue;
        }

        // Check if penalty already exists for this car park
        const existingPenalty =
          await this.infringementPenaltyRepository.findOne({
            where: {
              penaltyName: penaltyData.penaltyName,
              infringementCarParkId: infringementCarPark.id,
            },
          });

        if (!existingPenalty) {
          const penalty = this.infringementPenaltyRepository.create({
            infringementCarParkId: infringementCarPark.id,
            penaltyName: penaltyData.penaltyName,
            stripePriceIdBeforeDue: penaltyData.stripePriceIdBeforeDue || null,
            stripePriceIdAfterDue: penaltyData.stripePriceIdAfterDue || null,
            amountBeforeDue: penaltyData.amountBeforeDue,
            amountAfterDue: penaltyData.amountAfterDue,
          });

          await this.infringementPenaltyRepository.save(penalty);
          this.logger.log(
            `Infringement penalty ${penaltyData.penaltyName} for ${penaltyData.carParkName} seeded`
          );
        } else {
          this.logger.log(
            `Infringement penalty ${penaltyData.penaltyName} for ${penaltyData.carParkName} already exists`
          );
        }
      } catch (error) {
        this.logger.error(
          `Error seeding penalty ${penaltyData.penaltyName}:`,
          error
        );
        throw new CustomException(
          ErrorCode.SERVER_ERROR.key,
          HttpStatus.BAD_REQUEST
        );
      }
    }
  }
}
