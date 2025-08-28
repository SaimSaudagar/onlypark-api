import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { MasterCarPark } from './entities/master-car-park.entity';
import {
  CreateMasterCarParkRequest,
  UpdateMasterCarParkRequest,
} from './dto/master-car-park.dto';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class MasterCarParkService {
  constructor(
    @InjectRepository(MasterCarPark)
    private masterCarParkRepository: Repository<MasterCarPark>,
  ) {}

  async create(masterCarParkDto: CreateMasterCarParkRequest): Promise<MasterCarPark> {
    const { 
      carParkName, 
      totalCarSpace, 
      carParkType, 
      location, 
      lat, 
      lang, 
      description, 
      operatingHours, 
      tenantEmailCheck,
      geolocation,
      event,
      eventDate,
      eventExpiryDate,
      status 
    } = masterCarParkDto;

    // Generate unique car park code if not provided
    const carParkCode = masterCarParkDto.carParkCode || this.generateCarParkCode();
    
    // Generate slug if not provided
    const slug = masterCarParkDto.slug || this.generateSlug(carParkName);

    // Check if the car park code exists in the db
    const masterCarParkInDb = await this.masterCarParkRepository.findOne({
      where: { carParkCode },
    });
    if (masterCarParkInDb) {
      throw new BadRequestException('Master car park code already exists');
    }
    
    const masterCarPark = this.masterCarParkRepository.create({
      carParkName,
      totalCarSpace,
      carParkType,
      location,
      lat,
      lang,
      description,
      carParkCode,
      slug,
      operatingHours,
      tenantEmailCheck,
      geolocation,
      event,
      eventDate,
      eventExpiryDate,
      status,
    });
    return await this.masterCarParkRepository.save(masterCarPark);
  }

  async findAll(options?: FindManyOptions<MasterCarPark>): Promise<MasterCarPark[]> {
    return await this.masterCarParkRepository.find({
      ...options,
      relations: ['subCarParks'],
    });
  }

  async findOne(options?: FindOneOptions<MasterCarPark>): Promise<MasterCarPark> {
    const masterCarPark = await this.masterCarParkRepository.findOne({
      ...options,
      relations: ['subCarParks'],
    });
    return masterCarPark;
  }

  async update(id: string, updateMasterCarParkDto: UpdateMasterCarParkRequest) {
    const masterCarPark = await this.masterCarParkRepository.findOne({ where: { id } });
    if (!masterCarPark) {
      throw new BadRequestException('Master car park not found');
    }

    Object.assign(masterCarPark, updateMasterCarParkDto);
    return await this.masterCarParkRepository.save(masterCarPark);
  }

  async remove(id: string) {
    const masterCarPark = await this.masterCarParkRepository.findOne({ 
      where: { id },
      relations: ['subCarParks']
    });
    
    if (!masterCarPark) {
      throw new BadRequestException('Master car park not found');
    }

    if (masterCarPark.subCarParks && masterCarPark.subCarParks.length > 0) {
      throw new BadRequestException('Cannot delete master car park with existing sub car parks');
    }

    await this.masterCarParkRepository.remove(masterCarPark);
    return { message: 'Master car park deleted successfully' };
  }

  async generateQrCode(id: string): Promise<string> {
    try {
      const masterCarPark = await this.findOne({ where: { id } });
      if (!masterCarPark) {
        throw new BadRequestException('Master car park not found');
      }

      const qrData = {
        masterCarParkId: masterCarPark.id,
        carParkCode: masterCarPark.carParkCode,
        carParkName: masterCarPark.carParkName,
        location: masterCarPark.location,
        type: 'master'
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
      return qrCodeDataURL;
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  async getStatistics(id: string) {
    const masterCarPark = await this.findOne({ where: { id } });
    if (!masterCarPark) {
      throw new BadRequestException('Master car park not found');
    }

    const totalSubCarParks = masterCarPark.subCarParks?.length || 0;
    const totalSpaces = masterCarPark.subCarParks?.reduce((sum, sub) => sum + sub.carSpace, 0) || 0;
    const activeSubCarParks = masterCarPark.subCarParks?.filter(sub => sub.status === 'Active').length || 0;

    return {
      masterCarParkId: masterCarPark.id,
      masterCarParkName: masterCarPark.carParkName,
      totalSubCarParks,
      totalSpaces,
      activeSubCarParks,
      utilizationRate: totalSpaces > 0 ? (totalSpaces / masterCarPark.totalCarSpace) * 100 : 0
    };
  }

  private generateCarParkCode(): string {
    const prefix = 'MC';
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
