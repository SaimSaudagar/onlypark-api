import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { MasterCarPark } from './entities/master-car-park.entity';
import {
  CreateMasterCarParkRequest,
  UpdateMasterCarParkRequest,
} from './dto/master-car-park.dto';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { ParkingSpotStatus } from 'src/common/enums';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class MasterCarParkService {
  constructor(
    @InjectRepository(MasterCarPark)
    private masterCarParkRepository: Repository<MasterCarPark>,
  ) { }

  async create(masterCarParkDto: CreateMasterCarParkRequest): Promise<MasterCarPark> {
    const {
      carParkName,
      carParkType,
    } = masterCarParkDto;

    const masterCarParkCode = this.generateCarParkCode();

    const masterCarParkInDb = await this.masterCarParkRepository.findOne({
      where: { masterCarParkCode },
    });
    if (masterCarParkInDb) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_CODE_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const masterCarPark = this.masterCarParkRepository.create({
      carParkName,
      carParkType,
      masterCarParkCode,
      status: ParkingSpotStatus.ACTIVE,
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
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
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
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (masterCarPark.subCarParks && masterCarPark.subCarParks.length > 0) {
      throw new CustomException(
        ErrorCode.CANNOT_DELETE_MASTER_CAR_PARK_WITH_SUB_CAR_PARKS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.masterCarParkRepository.remove(masterCarPark);
    return { message: 'Master car park deleted successfully' };
  }

  async generateQrCode(id: string): Promise<string> {
    try {
      const masterCarPark = await this.findOne({ where: { id } });
      if (!masterCarPark) {
        throw new CustomException(
          ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      const qrData = {
        masterCarParkId: masterCarPark.id,
        masterCarParkCode: masterCarPark.masterCarParkCode,
        carParkName: masterCarPark.carParkName,
        type: 'master'
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
      return qrCodeDataURL;
    } catch (error) {
      throw new CustomException(
        ErrorCode.QR_CODE_GENERATION_FAILED.key,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getStatistics(id: string) {
    const masterCarPark = await this.findOne({ where: { id } });
    if (!masterCarPark) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
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
