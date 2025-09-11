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
      id,
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
      const masterCarParkExists = await this.masterCarParkService.findOne({ where: { id: masterCarParkId } });

      if (!masterCarParkExists) {
        throw new CustomException(
          ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      // If id is provided, this is an update operation
      if (id) {
        const existingSubCarPark = await queryRunner.manager
          .createQueryBuilder(SubCarPark, 'subCarPark')
          .where('subCarPark.id = :id', { id })
          .getOne();

        if (!existingSubCarPark) {
          throw new CustomException(
            ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Check if car park name already exists for a different sub car park
        const duplicateNameCheck = await queryRunner.manager
          .createQueryBuilder(SubCarPark, 'subCarPark')
          .where('subCarPark.carParkName = :carParkName', { carParkName })
          .andWhere('subCarPark.masterCarParkId = :masterCarParkId', { masterCarParkId })
          .andWhere('subCarPark.id != :id', { id })
          .getOne();

        if (duplicateNameCheck) {
          throw new CustomException(
            ErrorCode.SUB_CAR_PARK_NAME_ALREADY_EXISTS.key,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Update existing sub car park
        const updateData = {
          carParkName,
          carSpace,
          location,
          lat,
          lang,
          description,
          freeHours,
          tenantEmailCheck: tenantEmailCheck ?? false,
          noOfPermitsPerRegNo,
          event: event ?? false,
          eventDate: eventDateObj,
          eventExpiryDate: eventExpiryDateObj,
          masterCarParkId: masterCarParkExists.id,
        };

        await queryRunner.manager
          .createQueryBuilder()
          .update(SubCarPark)
          .set(updateData)
          .where('id = :id', { id })
          .execute();

        const updatedSubCarPark = await queryRunner.manager
          .createQueryBuilder(SubCarPark, 'subCarPark')
          .where('subCarPark.id = :id', { id })
          .getOne();

        // Handle tenancies update
        let savedTenancies = [];

        // Get existing tenancies for this sub car park
        const existingTenancies = await queryRunner.manager
          .createQueryBuilder()
          .select('*')
          .from('tenancies', 'tenancy')
          .where('tenancy.subCarParkId = :subCarParkId', { subCarParkId: id })
          .getRawMany();

        if (tenancies && tenancies.length > 0) {
          // Find tenancies to delete (existing ones not in the request)
          const requestTenantEmails = tenancies.map(tenant => tenant.tenantEmail);
          const tenanciesToDelete = existingTenancies.filter(
            existing => !requestTenantEmails.includes(existing.tenantEmail)
          );

          // Delete tenancies that are not in the request
          if (tenanciesToDelete.length > 0) {
            for (const tenantToDelete of tenanciesToDelete) {
              await this.tenancyService.remove(tenantToDelete.id);
            }
          }

          // Find tenancies to create (new ones not in existing)
          const existingTenantEmails = existingTenancies.map(tenant => tenant.tenantEmail);
          const tenanciesToCreate = tenancies.filter(
            tenant => !existingTenantEmails.includes(tenant.tenantEmail)
          );

          // Create new tenancies
          if (tenanciesToCreate.length > 0) {
            const tenanciesWithSubCarPark = tenanciesToCreate.map(tenant => {
              return {
                tenantName: tenant.tenantName,
                tenantEmail: tenant.tenantEmail,
                subCarParkId: id,
              };
            });

            savedTenancies = await this.tenancyService.createBulk(tenanciesWithSubCarPark, queryRunner);
          }

          // Get all current tenancies (existing + newly created)
          const allCurrentTenancies = await queryRunner.manager
            .createQueryBuilder()
            .select('*')
            .from('tenancies', 'tenancy')
            .where('tenancy.subCarParkId = :subCarParkId', { subCarParkId: id })
            .getRawMany();

          savedTenancies = allCurrentTenancies;
        } else {
          // If no tenancies in request, delete all existing ones
          if (existingTenancies.length > 0) {
            for (const tenantToDelete of existingTenancies) {
              await this.tenancyService.remove(tenantToDelete.id);
            }
          }
        }

        // Handle whitelist companies update
        let savedWhitelistCompanies = [];

        // Get existing whitelist companies for this sub car park
        const existingWhitelistCompanies = await queryRunner.manager
          .createQueryBuilder()
          .select('*')
          .from('whitelist_company', 'whitelist_company')
          .where('whitelist_company.subCarParkId = :subCarParkId', { subCarParkId: id })
          .getRawMany();

        if (whitelistCompanies && whitelistCompanies.length > 0) {
          // Find whitelist companies to delete (existing ones not in the request)
          const requestCompanyEmails = whitelistCompanies.map(company => company.email);
          const companiesToDelete = existingWhitelistCompanies.filter(
            existing => !requestCompanyEmails.includes(existing.email)
          );

          // Delete whitelist companies that are not in the request
          if (companiesToDelete.length > 0) {
            for (const companyToDelete of companiesToDelete) {
              await this.whitelistCompanyService.remove(companyToDelete.id);
            }
          }

          // Find whitelist companies to create (new ones not in existing)
          const existingCompanyEmails = existingWhitelistCompanies.map(company => company.email);
          const companiesToCreate = whitelistCompanies.filter(
            company => !existingCompanyEmails.includes(company.email)
          );

          // Create new whitelist companies
          if (companiesToCreate.length > 0) {
            const whitelistCompaniesWithSubCarPark = companiesToCreate.map(company => {
              return {
                companyName: company.companyName,
                email: company.email,
                subCarParkId: id,
              };
            });
            savedWhitelistCompanies = await this.whitelistCompanyService.createBulk(
              whitelistCompaniesWithSubCarPark,
              queryRunner
            );
          }

          // Get all current whitelist companies (existing + newly created)
          const allCurrentWhitelistCompanies = await queryRunner.manager
            .createQueryBuilder()
            .select('*')
            .from('whitelist_company', 'whitelist_company')
            .where('whitelist_company.subCarParkId = :subCarParkId', { subCarParkId: id })
            .getRawMany();

          savedWhitelistCompanies = allCurrentWhitelistCompanies;
        } else {
          // If no whitelist companies in request, delete all existing ones
          if (existingWhitelistCompanies.length > 0) {
            for (const companyToDelete of existingWhitelistCompanies) {
              await this.whitelistCompanyService.remove(companyToDelete.id);
            }
          }
        }

        await queryRunner.commitTransaction();
        return {
          id: updatedSubCarPark.id,
          carParkName: updatedSubCarPark.carParkName,
          carSpace: updatedSubCarPark.carSpace,
          location: updatedSubCarPark.location,
          subCarParkCode: updatedSubCarPark.subCarParkCode,
          status: updatedSubCarPark.status,
          masterCarParkId: updatedSubCarPark.masterCarParkId,
          tenancies: savedTenancies.map(tenant => ({ id: tenant.id, tenantName: tenant.tenantName, tenantEmail: tenant.tenantEmail })),
          whitelistCompanies: savedWhitelistCompanies.map(company => ({ id: company.id, companyName: company.companyName, email: company.email })),
        };
      } else {
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
            masterCarParkId: masterCarParkExists.id,
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
        }

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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
}
