import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class SubCarParkSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(SubCarPark)
    private readonly subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(MasterCarPark)
    private readonly masterCarParkRepository: Repository<MasterCarPark>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('Starting Sub Car Park Data seed');
    const subCarParks = FileUtils.getDataForSeeding('sub-car-parks');

    for (const subCarParkData of subCarParks) {
      const existingSubCarPark = await this.subCarParkRepository.findOne({
        where: { carParkName: subCarParkData.carParkName },
      });

      if (!existingSubCarPark) {
        // Find the master car park by name
        const masterCarPark = await this.masterCarParkRepository.findOne({
          where: { carParkName: subCarParkData.masterCarParkName },
        });

        if (!masterCarPark) {
          this.logger.warn(`Master Car Park ${subCarParkData.masterCarParkName} not found for Sub Car Park ${subCarParkData.carParkName}`);
          continue;
        }

        // Generate car park code and slug
        const carParkCode = this.generateCarParkCode();
        const slug = this.generateSlug(subCarParkData.carParkName);

        const subCarPark = this.subCarParkRepository.create({
          carParkName: subCarParkData.carParkName,
          carSpace: subCarParkData.carSpace,
          location: subCarParkData.location,
          lat: subCarParkData.lat,
          lang: subCarParkData.lang,
          description: subCarParkData.description,
          carParkCode: carParkCode,
          slug: slug,
          hours: subCarParkData.hours,
          tenantEmailCheck: subCarParkData.tenantEmailCheck,
          geolocation: subCarParkData.geolocation,
          event: subCarParkData.event,
          eventDate: subCarParkData.eventDate,
          eventExpiryDate: subCarParkData.eventExpiryDate,
          spotType: subCarParkData.spotType,
          status: subCarParkData.status,
          masterCarParkId: masterCarPark.id,
        });

        await this.subCarParkRepository.save(subCarPark);
        this.logger.log(`Sub Car Park ${subCarParkData.carParkName} seeded under ${subCarParkData.masterCarParkName}`);
      } else {
        this.logger.log(`Sub Car Park ${subCarParkData.carParkName} already exists`);
      }
    }
  }

  private generateCarParkCode(): string {
    const prefix = 'SC';
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
