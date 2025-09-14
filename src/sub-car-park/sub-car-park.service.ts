import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository, DataSource, Like, FindOptionsOrder, FindOptionsWhere, Not, In } from 'typeorm';
import { SubCarPark } from './entities/sub-car-park.entity';
import {
  CreateSubCarParkRequest,
  UpdateSubCarParkRequest,
  SubCarParkCreateResponse,
  SubCarParkUpdateResponse,
  SubCarParkDeleteResponse,
  FindSubCarParkResponse,
  FindSubCarParkRequest,
  FindAllSubCarParkResponse,
} from './sub-car-park.dto';
import * as crypto from 'crypto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { ParkingSpotStatus } from '../common/enums';
import { TenancyService } from '../tenancy/tenancy.service';
import { WhitelistCompanyService } from '../whitelist-company/whitelist-company.service';
import { MasterCarParkService } from '../master-car-park/master-car-park.service';
import { ApiGetBaseResponse } from '../common/types';
import { Tenancy } from '../tenancy/entities/tenancy.entity';
import { WhitelistCompany } from '../whitelist-company/entities/whitelist-company.entity';

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

    // Set dates to null if event is false
    const eventDateObj = (event && eventDate) ? new Date(eventDate) : null;
    const eventExpiryDateObj = (event && eventExpiryDate) ? new Date(eventExpiryDate) : null;

    if (event && eventDate && isNaN(eventDateObj.getTime())) {
      throw new CustomException(
        ErrorCode.INVALID_EVENT_DATE.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (event && eventExpiryDate && isNaN(eventExpiryDateObj.getTime())) {
      throw new CustomException(
        ErrorCode.INVALID_EVENT_DATE.key,
        HttpStatus.BAD_REQUEST,
      );
    }

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
        if (!company.companyName || !company.domainName) {
          throw new CustomException(
            ErrorCode.COMPANY_NAME_AND_DOMAIN_NAME_REQUIRED.key,
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

      if (masterCarPark.status !== ParkingSpotStatus.ACTIVE) {
        throw new CustomException(
          ErrorCode.MASTER_CAR_PARK_NOT_ACTIVE.key,
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
            domainName: company.domainName,
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
        whitelistCompanies: savedWhitelistCompanies.map(company => ({ id: company.id, companyName: company.companyName, domainName: company.domainName })),
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('SubCarParkService.create error:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(request: FindSubCarParkRequest): Promise<ApiGetBaseResponse<FindAllSubCarParkResponse>> {
    const { pageNo, pageSize, sortField, sortOrder, search, status } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<SubCarPark> = {};
    const orderOptions: FindOptionsOrder<SubCarPark> = {};

    if (search) {
      whereOptions.carParkName = Like(`%${search}%`);
    }

    if (status) {
      whereOptions.status = status;
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


    let response: FindAllSubCarParkResponse[] = subCarParks.map(subCarPark => ({
      id: subCarPark.id,
      carParkName: subCarPark.carParkName,
      carSpace: subCarPark.carSpace,
      location: subCarPark.location,
      lat: subCarPark.lat,
      lang: subCarPark.lang,
      status: subCarPark.status,
    }));

    return {
      rows: response,
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
        domainName: company.domainName,
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
        domainName: company.domainName,
      })) || [],
    }));
  }

  async update(id: string, request: UpdateSubCarParkRequest): Promise<SubCarParkUpdateResponse> {
    const {
      tenancies,
      whitelistCompanies,
      ...updateData
    } = request;

    const subCarPark = await this.subCarParkRepository.findOne({
      where: { id },
      relations: {
        tenancies: true,
        whitelistCompanies: true,
      }
    });

    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate car space if being updated
    if (updateData.carSpace !== undefined) {
      if (updateData.carSpace <= 0) {
        throw new CustomException(
          ErrorCode.INVALID_CAR_SPACE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (updateData.lat !== undefined) {
      if (updateData.lat < -90 || updateData.lat > 90) {
        throw new CustomException(
          ErrorCode.INVALID_LATITUDE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (updateData.lang !== undefined) {
      if (updateData.lang < -180 || updateData.lang > 180) {
        throw new CustomException(
          ErrorCode.INVALID_LONGITUDE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate event dates if being updated
    if (updateData.event && updateData.eventDate && updateData.eventExpiryDate) {
      const eventDate = new Date(updateData.eventDate);
      const eventExpiryDate = new Date(updateData.eventExpiryDate);

      if (isNaN(eventDate.getTime()) || isNaN(eventExpiryDate.getTime())) {
        throw new CustomException(
          ErrorCode.INVALID_EVENT_DATE.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (eventDate >= eventExpiryDate) {
        throw new CustomException(
          ErrorCode.INVALID_EVENT_DATE_RANGE.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Set event dates to null if event is false
    if (updateData.event === false) {
      updateData.eventDate = null;
      updateData.eventExpiryDate = null;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update the sub car park basic fields
      Object.assign(subCarPark, updateData);
      const updatedSubCarPark = await queryRunner.manager.save(subCarPark);

      // Handle tenancies update
      if (tenancies !== undefined) {
        // Check if any tenancies have IDs - if not, delete all existing ones
        const hasTenancyIds = tenancies.some(t => t.id);

        if (!hasTenancyIds) {
          // No IDs provided - delete all existing tenancies
          if (subCarPark.tenancies && subCarPark.tenancies.length > 0) {
            await queryRunner.manager.softRemove(subCarPark.tenancies);
          }
        } else {
          // Some IDs provided - only remove tenancies not in the provided list
          const providedTenancyIds = tenancies.filter(t => t.id).map(t => t.id);
          const tenanciesToRemove = subCarPark.tenancies.filter(
            existing => !providedTenancyIds.includes(existing.id)
          );

          if (tenanciesToRemove.length > 0) {
            await queryRunner.manager.softRemove(tenanciesToRemove);
          }
        }

        // Validate uniqueness for all provided tenancies first
        const tenantEmails = tenancies.map(t => t.tenantEmail);
        const duplicateEmails = tenantEmails.filter((email, index) => tenantEmails.indexOf(email) !== index);
        if (duplicateEmails.length > 0) {
          throw new CustomException(
            ErrorCode.TENANT_ALREADY_EXISTS.key,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Process each tenancy (update existing or create new)
        for (const tenancy of tenancies) {
          if (tenancy.id) {
            // Update existing tenancy
            const existingTenancy = await queryRunner.manager.findOne(Tenancy, { where: { id: tenancy.id } });
            if (existingTenancy) {
              // Check for unique email constraint (excluding current record)
              const emailExists = await queryRunner.manager.findOne(Tenancy, {
                where: {
                  tenantEmail: tenancy.tenantEmail,
                  id: Not(tenancy.id)
                }
              });

              if (emailExists) {
                throw new CustomException(
                  ErrorCode.TENANT_ALREADY_EXISTS.key,
                  HttpStatus.BAD_REQUEST,
                );
              }

              Object.assign(existingTenancy, {
                tenantName: tenancy.tenantName,
                tenantEmail: tenancy.tenantEmail,
              });
              await queryRunner.manager.save(existingTenancy);
            }
          } else {
            // Create new tenancy
            // Check for unique email constraint
            const emailExists = await queryRunner.manager.findOne(Tenancy, {
              where: { tenantEmail: tenancy.tenantEmail }
            });

            if (emailExists) {
              throw new CustomException(
                ErrorCode.TENANT_ALREADY_EXISTS.key,
                HttpStatus.BAD_REQUEST,
              );
            }

            const newTenancy = queryRunner.manager.create(Tenancy, {
              tenantName: tenancy.tenantName,
              tenantEmail: tenancy.tenantEmail,
              subCarParkId: updatedSubCarPark.id,
            });
            await queryRunner.manager.save(newTenancy);
          }
        }
      }

      // Handle whitelist companies update
      if (whitelistCompanies !== undefined) {
        // Check if any companies have IDs - if not, delete all existing ones
        const hasCompanyIds = whitelistCompanies.some(c => c.id);

        if (!hasCompanyIds) {
          // No IDs provided - delete all existing companies
          if (subCarPark.whitelistCompanies && subCarPark.whitelistCompanies.length > 0) {
            await queryRunner.manager.softRemove(subCarPark.whitelistCompanies);
          }
        } else {
          // Some IDs provided - only remove companies not in the provided list
          const providedCompanyIds = whitelistCompanies.filter(c => c.id).map(c => c.id);
          const companiesToRemove = subCarPark.whitelistCompanies.filter(
            existing => !providedCompanyIds.includes(existing.id)
          );

          if (companiesToRemove.length > 0) {
            await queryRunner.manager.softRemove(companiesToRemove);
          }
        }

        // Validate uniqueness for all provided companies first
        const companyDomainNames = whitelistCompanies.map(c => c.domainName);
        const duplicateDomains = companyDomainNames.filter((domain, index) => companyDomainNames.indexOf(domain) !== index);
        if (duplicateDomains.length > 0) {
          throw new CustomException(
            ErrorCode.WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS.key,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Process each company (update existing or create new)
        for (const company of whitelistCompanies) {
          if (company.id) {
            // Update existing company
            const existingCompany = await queryRunner.manager.findOne(WhitelistCompany, { where: { id: company.id } });
            if (existingCompany) {
              // Check for unique domain name constraint (excluding current record)
              const domainExists = await queryRunner.manager.findOne(WhitelistCompany, {
                where: {
                  domainName: company.domainName,
                  id: Not(company.id)
                }
              });

              if (domainExists) {
                throw new CustomException(
                  ErrorCode.WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS.key,
                  HttpStatus.BAD_REQUEST,
                );
              }

              Object.assign(existingCompany, {
                companyName: company.companyName,
                domainName: company.domainName,
              });
              await queryRunner.manager.save(existingCompany);
            }
          } else {
            // Create new company
            // Check for unique domain name constraint
            const domainExists = await queryRunner.manager.findOne(WhitelistCompany, {
              where: { domainName: company.domainName }
            });

            if (domainExists) {
              throw new CustomException(
                ErrorCode.WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS.key,
                HttpStatus.BAD_REQUEST,
              );
            }

            const newCompany = queryRunner.manager.create(WhitelistCompany, {
              companyName: company.companyName,
              domainName: company.domainName,
              subCarParkId: updatedSubCarPark.id,
            });
            await queryRunner.manager.save(newCompany);
          }
        }
      }

      await queryRunner.commitTransaction();

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
          domainName: company.domainName,
        })) || [],
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('SubCarParkService.update error:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
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
