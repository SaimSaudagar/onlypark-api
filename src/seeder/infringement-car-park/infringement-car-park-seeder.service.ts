import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InfringementCarPark } from "../../infringement/entities/infringement-car-park.entity";
import { FileUtils } from "../../common/utils/file.utils";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";

@Injectable()
export class InfringementCarParkSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(InfringementCarPark)
    private readonly infringementCarParkRepository: Repository<InfringementCarPark>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Infringement Car Park Data seed");
    const infringementCarParks = FileUtils.getDataForSeeding(
      "infringement-car-parks",
    );

    for (const carParkData of infringementCarParks) {
      try {
        // Check if infringement car park already exists
        const existingCarPark =
          await this.infringementCarParkRepository.findOne({
            where: { carParkName: carParkData.carParkName },
          });

        if (!existingCarPark) {
          const carPark = this.infringementCarParkRepository.create({
            carParkName: carParkData.carParkName,
          });

          await this.infringementCarParkRepository.save(carPark);
          this.logger.log(
            `Infringement car park ${carParkData.carParkName} seeded`,
          );
        } else {
          this.logger.log(
            `Infringement car park ${carParkData.carParkName} already exists`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error seeding infringement car park ${carParkData.carParkName}:`,
          error,
        );
        throw new CustomException(
          ErrorCode.SERVER_ERROR.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
