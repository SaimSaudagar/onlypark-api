import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class MasterCarParkSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(MasterCarPark)
    private readonly masterCarParkRepository: Repository<MasterCarPark>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('Starting Master Car Park Data seed');
    const masterCarParks = FileUtils.getDataForSeeding('master-car-parks');

    for (const masterCarParkData of masterCarParks) {
      const existingMasterCarPark = await this.masterCarParkRepository.findOne({
        where: { carParkName: masterCarParkData.carParkName },
      });

      if (!existingMasterCarPark) {
        // Generate car park code and slug
        const carParkCode = this.generateCarParkCode();
        const slug = this.generateSlug(masterCarParkData.carParkName);

        const masterCarPark = this.masterCarParkRepository.create({
          carParkName: masterCarParkData.carParkName,
          totalCarSpace: masterCarParkData.totalCarSpace,
          carParkType: masterCarParkData.carParkType,
          location: masterCarParkData.location,
          lat: masterCarParkData.lat,
          lang: masterCarParkData.lang,
          description: masterCarParkData.description,
          carParkCode: carParkCode,
          slug: slug,
          operatingHours: masterCarParkData.operatingHours,
          tenantEmailCheck: masterCarParkData.tenantEmailCheck,
          geolocation: masterCarParkData.geolocation,
          event: masterCarParkData.event,
          eventDate: masterCarParkData.eventDate,
          eventExpiryDate: masterCarParkData.eventExpiryDate,
          status: masterCarParkData.status,
        });

        await this.masterCarParkRepository.save(masterCarPark);
        this.logger.log(`Master Car Park ${masterCarParkData.carParkName} seeded`);
      } else {
        this.logger.log(`Master Car Park ${masterCarParkData.carParkName} already exists`);
      }
    }
  }

  private generateCarParkCode(): string {
    const prefix = 'MC';
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${randomSuffix}`;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
}
