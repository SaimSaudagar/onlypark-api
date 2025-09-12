import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository, DataSource, Like, FindOptionsOrder, FindOptionsWhere, In } from 'typeorm';
import { SubCarPark } from './entities/sub-car-park.entity';
import {
  CreateSubCarParkRequest,
  UpdateSubCarParkRequest,
  SubCarParkAvailabilityResponse,
  QrCodeResponse,
  SubCarParkCreateResponse,
  SubCarParkUpdateResponse,
  SubCarParkDeleteResponse,
  SubCarParkRequest,
  FindSubCarParkResponse,
} from './sub-car-park.dto';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { ParkingSpotStatus } from '../common/enums';
import { TenancyService } from '../tenancy/tenancy.service';
import { WhitelistCompanyService } from '../whitelist-company/whitelist-company.service';
import { MasterCarParkService } from '../master-car-park/master-car-park.service';
import { ApiGetBaseResponse } from '../common/types';

@Injectable()
export class SubCarParkService {
  constructor(
    @InjectRepository(SubCarPark)
    private subCarParkRepository: Repository<SubCarPark>,
    private masterCarParkService: MasterCarParkService,
    private tenancyService: TenancyService,
    private whitelistCompanyService: WhitelistCompanyService,
    private dataSource: DataSource,
  ) { }

  async create(request: CreateSubCarParkRequest): Promise<SubCarParkCreateResponse | SubCarParkUpdateResponse> {
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
      whitelistCompanies,
    } = request;
    console.log(request);
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

    // Validate whitelist companies
    if (whitelistCompanies && whitelistCompanies.length > 0) {
      for (const company of whitelistCompanies) {
        if (!company.companyName || !company.email) {
          throw new CustomException(
            ErrorCode.COMPANY_NAME_AND_EMAIL_REQUIRED.key,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const masterCarPark = await this.masterCarParkService.findById(masterCarParkId);

      if (!masterCarPark) {
        throw new CustomException(
          ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      // This is a create operation
      const existingSubCarPark = await queryRunner.manager
        .createQueryBuilder(SubCarPark, 'subCarPark')
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
      subCarParkCode = await this.generateCarParkCode();
      await queryRunner.manager
        .createQueryBuilder(SubCarPark, 'subCarPark')
        .where('subCarPark.subCarParkCode = :code', { code: subCarParkCode })
        .getOne();

      const subCarParkResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(SubCarPark)
        .values({
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
          masterCarParkId: masterCarPark.id,
        })
        .returning('*')
        .execute();

      const savedSubCarPark = subCarParkResult.raw[0];

      let savedTenancies = [];
      if (tenancies && tenancies.length > 0) {
        const tenanciesWithSubCarPark = tenancies.map(tenant => {
          return {
            tenantName: tenant.tenantName,
            tenantEmail: tenant.tenantEmail,
            subCarParkId: savedSubCarPark.id,
          };
        });

        savedTenancies = await this.tenancyService.createBulk(tenanciesWithSubCarPark, queryRunner);
      }

      let savedWhitelistCompanies = [];
      if (whitelistCompanies && whitelistCompanies.length > 0) {
        const whitelistCompaniesWithSubCarPark = whitelistCompanies.map(company => {
          return {
            companyName: company.companyName,
            email: company.email,
            subCarParkId: savedSubCarPark.id,
          };
        });
        savedWhitelistCompanies = await this.whitelistCompanyService.createBulk(
          whitelistCompaniesWithSubCarPark,
          queryRunner
        );


        await queryRunner.commitTransaction();
        return {
          id: savedSubCarPark.id,
          carParkName: savedSubCarPark.carParkName,
          carSpace: savedSubCarPark.carSpace,
          location: savedSubCarPark.location,
          subCarParkCode: savedSubCarPark.subCarParkCode,
          status: savedSubCarPark.status,
          masterCarParkId: savedSubCarPark.masterCarParkId,
          tenancies: savedTenancies.map(tenant => ({ id: tenant.id, tenantName: tenant.tenantName, tenantEmail: tenant.tenantEmail })),
          whitelistCompanies: savedWhitelistCompanies.map(company => ({ id: company.id, companyName: company.companyName, email: company.email })),
        };
      }

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('SubCarParkService.create error:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(request: SubCarParkRequest): Promise<ApiGetBaseResponse<FindSubCarParkResponse>> {
    const { pageNo, pageSize, sortField, sortOrder, name } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<SubCarPark> = {};
    const orderOptions: FindOptionsOrder<SubCarPark> = {};

    if (name) {
      whereOptions.carParkName = Like(`%${name}%`);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const [subCarParks, totalItems] = await this.subCarParkRepository.findAndCount({
      skip,
      take,
      relations: {
        masterCarPark: true,
        tenancies: true,
        whitelistCompanies: true,
      },
      where: whereOptions,
      order: orderOptions,
    });

    return {
      rows: subCarParks.map(subCarPark => ({
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
        whitelistCompanies: subCarPark.whitelistCompanies?.map(company => ({
          id: company.id,
          companyName: company.companyName,
          email: company.email,
        })) || [],
      })),
      pagination: {
        size: pageSize,
        page: pageNo,
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
      },
    };
  }

  async findOne(options?: FindOneOptions<SubCarPark>): Promise<FindSubCarParkResponse> {
    const subCarPark = await this.subCarParkRepository.findOne({
      ...options,
      relations: {
        masterCarPark: true,
        tenancies: true,
        whitelistCompanies: true,
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
      tenancies: subCarPark.tenancies?.map(tenancy => ({
        id: tenancy.id,
        tenantName: tenancy.tenantName,
        tenantEmail: tenancy.tenantEmail,
      })) || [],
      whitelistCompanies: subCarPark.whitelistCompanies?.map(company => ({
        id: company.id,
        companyName: company.companyName,
        email: company.email,
      })) || [],
    };
  }

  async findByMasterCarPark(masterCarParkId: string): Promise<FindSubCarParkResponse[]> {
    const subCarParks = await this.subCarParkRepository.find({
      where: { masterCarParkId },
      relations: {
        masterCarPark: true,
        tenancies: true,
        whitelistCompanies: true,
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
      whitelistCompanies: subCarPark.whitelistCompanies?.map(company => ({
        id: company.id,
        companyName: company.companyName,
        email: company.email,
      })) || [],
    }));
  }

  async update(id: string, request: UpdateSubCarParkRequest): Promise<SubCarParkUpdateResponse> {
    const subCarPark = await this.subCarParkRepository.findOne({ where: { id } });
    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate car space if being updated
    if (request.carSpace !== undefined) {
      if (request.carSpace <= 0) {
        throw new CustomException(
          ErrorCode.INVALID_CAR_SPACE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (request.lat !== undefined) {
      if (request.lat < -90 || request.lat > 90) {
        throw new CustomException(
          ErrorCode.INVALID_LATITUDE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (request.lang !== undefined) {
      if (request.lang < -180 || request.lang > 180) {
        throw new CustomException(
          ErrorCode.INVALID_LONGITUDE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate event dates if being updated
    if (request.event && request.eventDate && request.eventExpiryDate) {
      const eventDate = new Date(request.eventDate);
      const eventExpiryDate = new Date(request.eventExpiryDate);

      if (eventDate >= eventExpiryDate) {
        throw new CustomException(
          ErrorCode.INVALID_EVENT_DATE_RANGE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    Object.assign(subCarPark, request);
    const updatedSubCarPark = await this.subCarParkRepository.create(subCarPark);

    // Fetch the updated sub car park with relations
    const subCarParkWithRelations = await this.subCarParkRepository.findOne({
      where: { id },
      relations: {
        tenancies: true,
        whitelistCompanies: true,
      },
    });

    return {
      id: updatedSubCarPark.id,
      carParkName: updatedSubCarPark.carParkName,
      carSpace: updatedSubCarPark.carSpace,
      location: updatedSubCarPark.location,
      subCarParkCode: updatedSubCarPark.subCarParkCode,
      status: updatedSubCarPark.status,
      masterCarParkId: updatedSubCarPark.masterCarParkId,
      tenancies: subCarParkWithRelations?.tenancies?.map(tenant => ({
        id: tenant.id,
        tenantName: tenant.tenantName,
        tenantEmail: tenant.tenantEmail,
      })) || [],
      whitelistCompanies: subCarParkWithRelations?.whitelistCompanies?.map(company => ({
        id: company.id,
        companyName: company.companyName,
        email: company.email,
      })) || [],
    };
  }

  async remove(id: string): Promise<SubCarParkDeleteResponse> {
    const subCarPark = await this.subCarParkRepository.findOne({
      where: { id },
      relations: {
        bookings: true,
        tenancies: true,
        whitelists: true,
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
    };
  }

  private async generateCarParkCode(): Promise<string> {
    const prefix = 'SC';
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();

    const carParkCodeInDb = await this.subCarParkRepository.findOne({
      where: { subCarParkCode: `${prefix}${randomSuffix}` },
    });

    if (carParkCodeInDb) {
      return await this.generateCarParkCode();
    }

    return `${prefix}${randomSuffix}`;
  }
}
