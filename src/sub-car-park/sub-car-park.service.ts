import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { SubCarPark } from './entities/sub-car-park.entity';
import { MasterCarPark } from '../master-car-park/entities/master-car-park.entity';
import {
  CreateSubCarParkRequest,
  UpdateSubCarParkRequest,
} from './dto/sub-car-park.dto';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class SubCarParkService {
  constructor(
    @InjectRepository(SubCarPark)
    private subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(MasterCarPark)
    private masterCarParkRepository: Repository<MasterCarPark>,
  ) {}

  async create(subCarParkDto: CreateSubCarParkRequest): Promise<SubCarPark> {
    const { 
      carParkName, 
      carSpace, 
      location, 
      lat, 
      lang, 
      description, 
      hours, 
      tenantEmailCheck,
      geolocation,
      event,
      eventDate,
      eventExpiryDate,
      spotType,
      status,
      masterCarParkId
    } = subCarParkDto;

    // Verify master car park exists
    const masterCarPark = await this.masterCarParkRepository.findOne({
      where: { id: masterCarParkId },
    });
    if (!masterCarPark) {
      throw new BadRequestException('Master car park not found');
    }

    // Generate unique car park code if not provided
    const carParkCode = subCarParkDto.carParkCode || this.generateCarParkCode();
    
    // Generate slug if not provided
    const slug = subCarParkDto.slug || this.generateSlug(carParkName);

    // Check if the car park code exists in the db
    const subCarParkInDb = await this.subCarParkRepository.findOne({
      where: { carParkCode },
    });
    if (subCarParkInDb) {
      throw new BadRequestException('Sub car park code already exists');
    }

    // Check if total car spaces exceed master car park capacity
    const existingSubCarParks = await this.subCarParkRepository.find({
      where: { masterCarParkId },
    });
    const totalExistingSpaces = existingSubCarParks.reduce((sum, park) => sum + park.carSpace, 0);
    if (totalExistingSpaces + carSpace > masterCarPark.totalCarSpace) {
      throw new BadRequestException(`Total car spaces (${totalExistingSpaces + carSpace}) exceed master car park capacity (${masterCarPark.totalCarSpace})`);
    }
    
    const subCarPark = this.subCarParkRepository.create({
      carParkName,
      carSpace,
      location,
      lat,
      lang,
      description,
      carParkCode,
      slug,
      hours,
      tenantEmailCheck,
      geolocation,
      event,
      eventDate,
      eventExpiryDate,
      spotType,
      status,
      masterCarParkId,
    });
    return await this.subCarParkRepository.save(subCarPark);
  }

  async findAll(options?: FindManyOptions<SubCarPark>): Promise<SubCarPark[]> {
    return await this.subCarParkRepository.find({
      ...options,
      relations: ['masterCarPark'],
    });
  }

  async findOne(options?: FindOneOptions<SubCarPark>): Promise<SubCarPark> {
    const subCarPark = await this.subCarParkRepository.findOne({
      ...options,
      relations: ['masterCarPark'],
    });
    return subCarPark;
  }

  async findByMasterCarPark(masterCarParkId: string): Promise<SubCarPark[]> {
    return await this.subCarParkRepository.find({
      where: { masterCarParkId },
      relations: ['masterCarPark'],
    });
  }

  async update(id: string, updateSubCarParkDto: UpdateSubCarParkRequest) {
    const subCarPark = await this.subCarParkRepository.findOne({ where: { id } });
    if (!subCarPark) {
      throw new BadRequestException('Sub car park not found');
    }

    // If car space is being updated, check capacity
    if (updateSubCarParkDto.carSpace) {
      const masterCarPark = await this.masterCarParkRepository.findOne({
        where: { id: subCarPark.masterCarParkId },
      });
      
      const existingSubCarParks = await this.subCarParkRepository.find({
        where: { masterCarParkId: subCarPark.masterCarParkId },
      });
      
      const totalExistingSpaces = existingSubCarParks
        .filter(park => park.id !== id)
        .reduce((sum, park) => sum + park.carSpace, 0);
        
      if (totalExistingSpaces + updateSubCarParkDto.carSpace > masterCarPark.totalCarSpace) {
        throw new BadRequestException(`Total car spaces (${totalExistingSpaces + updateSubCarParkDto.carSpace}) exceed master car park capacity (${masterCarPark.totalCarSpace})`);
      }
    }

    Object.assign(subCarPark, updateSubCarParkDto);
    return await this.subCarParkRepository.save(subCarPark);
  }

  async remove(id: string) {
    const subCarPark = await this.subCarParkRepository.findOne({ 
      where: { id },
      relations: ['bookings', 'tenancies', 'whitelists', 'blacklists']
    });
    
    if (!subCarPark) {
      throw new BadRequestException('Sub car park not found');
    }

    // Check if sub car park has any related data
    if (subCarPark.bookings && subCarPark.bookings.length > 0) {
      throw new BadRequestException('Cannot delete sub car park with existing bookings');
    }

    if (subCarPark.tenancies && subCarPark.tenancies.length > 0) {
      throw new BadRequestException('Cannot delete sub car park with existing tenancies');
    }

    await this.subCarParkRepository.remove(subCarPark);
    return { message: 'Sub car park deleted successfully' };
  }

  async generateQrCode(id: string): Promise<string> {
    try {
      const subCarPark = await this.findOne({ where: { id } });
      if (!subCarPark) {
        throw new BadRequestException('Sub car park not found');
      }

      const qrData = {
        subCarParkId: subCarPark.id,
        carParkCode: subCarPark.carParkCode,
        carParkName: subCarPark.carParkName,
        location: subCarPark.location,
        masterCarParkId: subCarPark.masterCarParkId,
        type: 'sub'
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
      return qrCodeDataURL;
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  async getAvailability(id: string) {
    const subCarPark = await this.findOne({ where: { id } });
    if (!subCarPark) {
      throw new BadRequestException('Sub car park not found');
    }

    // This would typically involve checking bookings and calculating availability
    // For now, returning basic info
    return {
      subCarParkId: subCarPark.id,
      carParkName: subCarPark.carParkName,
      totalSpaces: subCarPark.carSpace,
      status: subCarPark.status,
      // Additional availability logic would go here
    };
  }

  private generateCarParkCode(): string {
    const prefix = 'SC';
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
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
