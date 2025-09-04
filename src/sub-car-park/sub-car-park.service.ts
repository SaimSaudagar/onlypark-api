import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { SubCarPark } from './entities/sub-car-park.entity';
import { MasterCarPark } from '../master-car-park/entities/master-car-park.entity';
import {
  CreateSubCarParkRequest,
  UpdateSubCarParkRequest,
  SubCarParkResponse,
  SubCarParkAvailabilityResponse,
  QrCodeResponse,
  SubCarParkCreateResponse,
  SubCarParkUpdateResponse,
  SubCarParkDeleteResponse,
} from './dto/sub-car-park.dto';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { ParkingSpotStatus } from '../common/enums';
import { TenancyService } from '../tenancy/tenancy.service';

@Injectable()
export class SubCarParkService {
  constructor(
    @InjectRepository(SubCarPark)
    private subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(MasterCarPark)
    private masterCarParkRepository: Repository<MasterCarPark>,
    private tenancyService: TenancyService,
  ) { }

  async create(subCarParkDto: CreateSubCarParkRequest): Promise<SubCarParkCreateResponse> {
    const {
      masterCarParkId,
      carParkName,
      location,
      lat,
      lang,
      carSpace,
      freeHours,
      tenantEmailCheck,
      noOfPermitsPerRegNo,
      event,
      eventDate,
      eventExpiryDate,
      description,
      tenancies,
    } = subCarParkDto;

    if (!masterCarParkId || !carParkName || !location || lat === undefined || lang === undefined || !carSpace) {
      throw new CustomException(
        ErrorCode.CLIENT_ERROR.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (carSpace <= 0) {
      throw new CustomException(
        ErrorCode.INVALID_CAR_SPACE.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lat < -90 || lat > 90) {
      throw new CustomException(
        ErrorCode.INVALID_LATITUDE.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lang < -180 || lang > 180) {
      throw new CustomException(
        ErrorCode.INVALID_LONGITUDE.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const eventDateObj = eventDate ? new Date(eventDate) : undefined;
    const eventExpiryDateObj = eventExpiryDate ? new Date(eventExpiryDate) : undefined;

    if (event) {
      if (!eventDateObj || !eventExpiryDateObj) {
        throw new CustomException(
          ErrorCode.INVALID_EVENT_DATE.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (eventDateObj >= eventExpiryDateObj) {
        throw new CustomException(
          ErrorCode.INVALID_EVENT_DATE_RANGE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (freeHours !== undefined && freeHours < 1) {
      throw new CustomException(
        ErrorCode.INVALID_FREE_HOURS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (noOfPermitsPerRegNo !== undefined && noOfPermitsPerRegNo < 1) {
      throw new CustomException(
        ErrorCode.INVALID_PERMITS_PER_REGISTRATION.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const masterCarParkExists = await this.masterCarParkRepository
      .createQueryBuilder('masterCarPark')
      .where('masterCarPark.id = :id', { id: masterCarParkId })
      .getOne();

    if (!masterCarParkExists) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSubCarPark = await this.subCarParkRepository
      .createQueryBuilder('subCarPark')
      .where('subCarPark.carParkName = :carParkName', { carParkName })
      .andWhere('subCarPark.masterCarParkId = :masterCarParkId', { masterCarParkId })
      .getOne();

    if (existingSubCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NAME_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    let subCarParkCode: string;
    let isCodeUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isCodeUnique && attempts < maxAttempts) {
      subCarParkCode = this.generateCarParkCode();
      const existingCode = await this.subCarParkRepository
        .createQueryBuilder('subCarPark')
        .where('subCarPark.subCarParkCode = :code', { code: subCarParkCode })
        .getOne();

      if (!existingCode) {
        isCodeUnique = true;
      }
      attempts++;
    }

    if (!isCodeUnique) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_CODE_GENERATION_FAILED.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let tenanciesIds: string[] = [];
    if (tenancies && tenancies.length > 0) {
      for (const tenant of tenancies) {
        if (!tenant.tenantName || !tenant.tenantEmail) {
          throw new CustomException(
            ErrorCode.INVALID_TENANCY_DATA.key,
            HttpStatus.BAD_REQUEST,
          );
        }

        const existingTenant = await this.tenancyService.findOne({
          where: { tenantEmail: tenant.tenantEmail },
        });

        if (existingTenant) {
          throw new CustomException(
            ErrorCode.TENANT_ALREADY_EXISTS.key,
            HttpStatus.BAD_REQUEST,
            { tenantEmail: tenant.tenantEmail },
          );
        }
      }

      const createdTenancies = await this.tenancyService.createBulk(tenancies);
      tenanciesIds = createdTenancies.map((tenant) => tenant.id);
    }

    const subCarPark = this.subCarParkRepository.create({
      carParkName,
      carSpace,
      location,
      lat,
      lang,
      description,
      subCarParkCode,
      freeHours,
      tenantEmailCheck: tenantEmailCheck ?? false,
      noOfPermitsPerRegNo,
      event: event ?? false,
      eventDate: eventDateObj,
      eventExpiryDate: eventExpiryDateObj,
      status: ParkingSpotStatus.ACTIVE,
      masterCarParkId: masterCarParkExists.id,
      tenancyIds: tenanciesIds,
    });

    const savedSubCarPark = await this.subCarParkRepository.save(subCarPark);

    if (tenanciesIds.length > 0) {
      await this.tenancyService.updateTenanciesWithSubCarParkId(tenanciesIds, savedSubCarPark.id);
    }

    return {
      id: savedSubCarPark.id,
      carParkName: savedSubCarPark.carParkName,
      carSpace: savedSubCarPark.carSpace,
      location: savedSubCarPark.location,
      subCarParkCode: savedSubCarPark.subCarParkCode,
      status: savedSubCarPark.status,
      masterCarParkId: savedSubCarPark.masterCarParkId,
      tenancyCount: tenanciesIds.length,
      createdAt: savedSubCarPark.createdAt,
    };
  }

  async findAll(options?: FindManyOptions<SubCarPark>): Promise<SubCarParkResponse[]> {
    const subCarParks = await this.subCarParkRepository.find({
      ...options,
      relations: {
        masterCarPark: true,
        tenancies: true,
      },
    });

    return subCarParks.map(subCarPark => ({
      id: subCarPark.id,
      carParkName: subCarPark.carParkName,
      carSpace: subCarPark.carSpace,
      location: subCarPark.location,
      lat: subCarPark.lat,
      lang: subCarPark.lang,
      tenantEmailCheck: subCarPark.tenantEmailCheck,
      geolocation: subCarPark.geolocation,
      event: subCarPark.event,
      subCarParkCode: subCarPark.subCarParkCode,
      status: subCarPark.status,
      masterCarParkId: subCarPark.masterCarParkId,
      masterCarPark: subCarPark.masterCarPark ? {
        id: subCarPark.masterCarPark.id,
        carParkName: subCarPark.masterCarPark.carParkName,
        masterCarParkCode: subCarPark.masterCarPark.masterCarParkCode,
        carParkType: subCarPark.masterCarPark.carParkType,
        status: subCarPark.masterCarPark.status,
      } : undefined,
      tenancies: subCarPark.tenancies?.map(tenancy => ({
        id: tenancy.id,
        tenantName: tenancy.tenantName,
        tenantEmail: tenancy.tenantEmail,
      })) || [],
    }));
  }

  async findOne(options?: FindOneOptions<SubCarPark>): Promise<SubCarParkResponse> {
    const subCarPark = await this.subCarParkRepository.findOne({
      ...options,
      relations: {
        masterCarPark: true,
        tenancies: true,
      },
    });

    if (!subCarPark) {
      return null;
    }

    return {
      id: subCarPark.id,
      carParkName: subCarPark.carParkName,
      carSpace: subCarPark.carSpace,
      location: subCarPark.location,
      lat: subCarPark.lat,
      lang: subCarPark.lang,
      description: subCarPark.description,
      subCarParkCode: subCarPark.subCarParkCode,
      freeHours: subCarPark.freeHours,
      tenantEmailCheck: subCarPark.tenantEmailCheck,
      geolocation: subCarPark.geolocation,
      event: subCarPark.event,
      eventDate: subCarPark.eventDate,
      eventExpiryDate: subCarPark.eventExpiryDate,
      status: subCarPark.status,
      masterCarParkId: subCarPark.masterCarParkId,
      masterCarPark: subCarPark.masterCarPark ? {
        id: subCarPark.masterCarPark.id,
        carParkName: subCarPark.masterCarPark.carParkName,
        masterCarParkCode: subCarPark.masterCarPark.masterCarParkCode,
        carParkType: subCarPark.masterCarPark.carParkType,
        status: subCarPark.masterCarPark.status,
      } : undefined,
      tenancies: subCarPark.tenancies?.map(tenancy => ({
        id: tenancy.id,
        tenantName: tenancy.tenantName,
        tenantEmail: tenancy.tenantEmail,
      })) || [],
    };
  }

  async findByMasterCarPark(masterCarParkId: string): Promise<SubCarParkResponse[]> {
    const subCarParks = await this.subCarParkRepository.find({
      where: { masterCarParkId },
      relations: {
        masterCarPark: true,
        tenancies: true,
      },
    });

    return subCarParks.map(subCarPark => ({
      id: subCarPark.id,
      carParkName: subCarPark.carParkName,
      carSpace: subCarPark.carSpace,
      location: subCarPark.location,
      lat: subCarPark.lat,
      lang: subCarPark.lang,
      tenantEmailCheck: subCarPark.tenantEmailCheck,
      geolocation: subCarPark.geolocation,
      event: subCarPark.event,
      subCarParkCode: subCarPark.subCarParkCode,
      status: subCarPark.status,
      masterCarParkId: subCarPark.masterCarParkId,
      masterCarPark: subCarPark.masterCarPark ? {
        id: subCarPark.masterCarPark.id,
        carParkName: subCarPark.masterCarPark.carParkName,
        masterCarParkCode: subCarPark.masterCarPark.masterCarParkCode,
        carParkType: subCarPark.masterCarPark.carParkType,
        status: subCarPark.masterCarPark.status,
      } : undefined,
      tenancies: subCarPark.tenancies?.map(tenancy => ({
        id: tenancy.id,
        tenantName: tenancy.tenantName,
        tenantEmail: tenancy.tenantEmail,
      })) || [],
    }));
  }

  async update(id: string, updateSubCarParkDto: UpdateSubCarParkRequest): Promise<SubCarParkUpdateResponse> {
    const subCarPark = await this.subCarParkRepository.findOne({ where: { id } });
    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate car space if being updated
    if (updateSubCarParkDto.carSpace !== undefined) {
      if (updateSubCarParkDto.carSpace <= 0) {
        throw new CustomException(
          ErrorCode.INVALID_CAR_SPACE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (updateSubCarParkDto.lat !== undefined) {
      if (updateSubCarParkDto.lat < -90 || updateSubCarParkDto.lat > 90) {
        throw new CustomException(
          ErrorCode.INVALID_LATITUDE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (updateSubCarParkDto.lang !== undefined) {
      if (updateSubCarParkDto.lang < -180 || updateSubCarParkDto.lang > 180) {
        throw new CustomException(
          ErrorCode.INVALID_LONGITUDE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate event dates if being updated
    if (updateSubCarParkDto.event && updateSubCarParkDto.eventDate && updateSubCarParkDto.eventExpiryDate) {
      const eventDate = new Date(updateSubCarParkDto.eventDate);
      const eventExpiryDate = new Date(updateSubCarParkDto.eventExpiryDate);

      if (eventDate >= eventExpiryDate) {
        throw new CustomException(
          ErrorCode.INVALID_EVENT_DATE_RANGE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    Object.assign(subCarPark, updateSubCarParkDto);
    const updatedSubCarPark = await this.subCarParkRepository.save(subCarPark);

    return {
      id: updatedSubCarPark.id,
      carParkName: updatedSubCarPark.carParkName,
      carSpace: updatedSubCarPark.carSpace,
      location: updatedSubCarPark.location,
      subCarParkCode: updatedSubCarPark.subCarParkCode,
      status: updatedSubCarPark.status,
      masterCarParkId: updatedSubCarPark.masterCarParkId,
      updatedAt: updatedSubCarPark.updatedAt,
      message: 'Sub car park updated successfully',
    };
  }

  async remove(id: string): Promise<SubCarParkDeleteResponse> {
    const subCarPark = await this.subCarParkRepository.findOne({
      where: { id },
      relations: {
        bookings: true,
        tenancies: true,
        whitelists: true,
        blacklists: true,
      },
    });

    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (subCarPark.bookings && subCarPark.bookings.length > 0) {
      throw new CustomException(
        ErrorCode.CANNOT_DELETE_SUB_CAR_PARK_WITH_BOOKINGS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (subCarPark.tenancies && subCarPark.tenancies.length > 0) {
      throw new CustomException(
        ErrorCode.CANNOT_DELETE_SUB_CAR_PARK_WITH_TENANCIES.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const carParkName = subCarPark.carParkName;
    await this.subCarParkRepository.remove(subCarPark);

    return {
      id,
      carParkName,
      message: 'Sub car park deleted successfully',
      deletedAt: new Date(),
    };
  }

  async generateQrCode(id: string): Promise<QrCodeResponse> {
    try {
      const subCarPark = await this.findOne({ where: { id } });
      if (!subCarPark) {
        throw new CustomException(
          ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      const qrData = {
        subCarParkId: subCarPark.id,
        subCarParkCode: subCarPark.subCarParkCode,
        carParkName: subCarPark.carParkName,
        masterCarParkId: subCarPark.masterCarParkId,
        type: 'sub'
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

      return {
        subCarParkId: subCarPark.id,
        subCarParkCode: subCarPark.subCarParkCode,
        carParkName: subCarPark.carParkName,
        masterCarParkId: subCarPark.masterCarParkId,
        qrCode: qrCodeDataURL,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new CustomException(
        ErrorCode.QR_CODE_GENERATION_FAILED.key,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAvailability(id: string): Promise<SubCarParkAvailabilityResponse> {
    const subCarPark = await this.findOne({ where: { id } });
    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // TODO: Implement actual availability calculation based on bookings
    // For now, returning mock data
    const totalSpaces = subCarPark.carSpace;
    const occupiedSpaces = 0; // This should be calculated from actual bookings
    const availableSpaces = totalSpaces - occupiedSpaces;

    return {
      subCarParkId: subCarPark.id,
      carParkName: subCarPark.carParkName,
      totalSpaces,
      availableSpaces,
      occupiedSpaces,
      status: subCarPark.status,
      freeHours: subCarPark.freeHours,
      event: subCarPark.event,
      eventDate: subCarPark.eventDate,
      eventExpiryDate: subCarPark.eventExpiryDate,
      lastUpdated: new Date(),
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
