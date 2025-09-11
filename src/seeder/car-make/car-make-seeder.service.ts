import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarMake } from '../../car-make/entities/car-make.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class CarMakeSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(CarMake)
    private readonly carMakeRepository: Repository<CarMake>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('Starting Car Make Data seed');
    const carMakes = FileUtils.getDataForSeeding('car-makes');

    for (const carMakeData of carMakes) {
      const existingCarMake = await this.carMakeRepository.findOne({
        where: { carMakeName: carMakeData.name },
      });

      if (!existingCarMake) {
        const carMake = this.carMakeRepository.create({
          carMakeName: carMakeData.name,
        });

        await this.carMakeRepository.create(carMake);
        this.logger.log(`Car Make ${carMakeData.name} seeded`);
      } else {
        this.logger.log(`Car Make ${carMakeData.name} already exists`);
      }
    }
  }
}
