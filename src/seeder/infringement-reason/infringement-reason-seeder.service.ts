import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InfringementReason } from "../../infringement/entities/infringement-reason.entity";
import { FileUtils } from "../../common/utils/file.utils";

@Injectable()
export class InfringementReasonSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(InfringementReason)
    private readonly infringementReasonRepository: Repository<InfringementReason>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Infringement Reason Data seed");
    const infringementReasons = FileUtils.getDataForSeeding(
      "infringement-reasons",
    );

    for (const infringementReasonData of infringementReasons) {
      const existingInfringementReason =
        await this.infringementReasonRepository.findOne({
          where: { reason: infringementReasonData.reason },
        });

      if (!existingInfringementReason) {
        const infringementReason = this.infringementReasonRepository.create({
          reason: infringementReasonData.reason,
        });

        await this.infringementReasonRepository.save(infringementReason);
        this.logger.log(
          `Infringement Reason "${infringementReasonData.reason}" seeded`,
        );
      } else {
        this.logger.log(
          `Infringement Reason "${infringementReasonData.reason}" already exists`,
        );
      }
    }

    this.logger.log("Infringement Reason Data seed completed");
  }
}
