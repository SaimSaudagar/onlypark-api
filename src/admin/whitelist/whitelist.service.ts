import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
  FindManyOptions,
  Between,
} from "typeorm";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { HttpStatus } from "@nestjs/common";
import {
  CreateWhitelistRequest,
  CreateWhitelistResponse,
  FindWhitelistRequest,
  FindWhitelistResponse,
  UpdateWhitelistRequest,
  UpdateWhitelistResponse,
  WhitelistDeleteResponse,
  BulkDeleteWhitelistResponse,
} from "./whitelist.dto";
import { SubCarParkService } from "../sub-car-park/sub-car-park.service";
import { TenancyService } from "../../tenancy/tenancy.service";
import {
  ApiGetBaseResponse,
  WhitelistStatus,
  WhitelistType,
} from "../../common";
import { BlacklistService } from "../blacklist/blacklist.service";

@Injectable()
export class WhitelistService {
  constructor(
    @InjectRepository(Whitelist)
    private whitelistRepository: Repository<Whitelist>,
    private subCarParkService: SubCarParkService,
    private tenancyService: TenancyService,
    private blacklistService: BlacklistService
  ) {}

  async findAll(
    request: FindWhitelistRequest
  ): Promise<ApiGetBaseResponse<FindWhitelistResponse>> {
    const {
      search,
      sortField,
      sortOrder,
      pageNo,
      pageSize,
      type,
      subCarParkId,
    } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<Whitelist> = {};
    const orderOptions: FindOptionsOrder<Whitelist> = {};

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    if (type) {
      whereOptions.whitelistType = type;
    }

    if (subCarParkId) {
      whereOptions.subCarParkId = subCarParkId;
    }

    const [whitelists, totalItems] =
      await this.whitelistRepository.findAndCount({
        where: search
          ? [
              { ...whereOptions, email: ILike(`%${search}%`) },
              { ...whereOptions, registrationNumber: ILike(`%${search}%`) },
            ]
          : whereOptions,
        order: orderOptions,
        skip,
        take,
        relations: {
          subCarPark: true,
          tenancy: true,
        },
      });

    const response = whitelists.map((whitelist) => ({
      id: whitelist.id,
      registrationNumber: whitelist.registrationNumber,
      email: whitelist.email,
      startDate: whitelist.startDate,
      endDate: whitelist.endDate,
      type: whitelist.whitelistType,
      carParkName: whitelist.subCarPark.carParkName,
      tenancyName: whitelist.tenancy.tenantName,
      status: whitelist.status,
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

  async findOne(options?: FindOneOptions<Whitelist>): Promise<Whitelist> {
    const entity = await this.whitelistRepository.findOne(options);
    if (!entity) {
      throw new CustomException(
        ErrorCode.WHITELIST_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }
    return entity;
  }

  async create(
    request: CreateWhitelistRequest
  ): Promise<CreateWhitelistResponse> {
    const { type, subCarParkId, tenancyId, email, registrationNumber } =
      request;

    // Validate subCarPark
    const subCarPark = await this.subCarParkService.findOne({
      where: { id: subCarParkId },
    });
    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    // Validate tenancy
    const tenancy = await this.tenancyService.findOne({
      where: { id: tenancyId },
    });
    if (!tenancy) {
      throw new CustomException(
        ErrorCode.TENANCY_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    const isBlacklisted =
      await this.blacklistService.isRegistrationNumberBlacklistedInSubCarPark(
        registrationNumber,
        subCarParkId
      );
    if (isBlacklisted) {
      throw new CustomException(
        ErrorCode.REGISTRATION_NUMBER_BLACKLISTED_IN_SUB_CAR_PARK.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const companyEmails = await this.subCarParkService.findOne({
      where: {
        id: subCarParkId,
      },
      relations: {
        whitelistCompanies: true,
      },
      select: {
        whitelistCompanies: {
          domainName: true,
        },
      },
    });

    if (!companyEmails) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    const domainNames = companyEmails.whitelistCompanies.map(
      (company) => company.domainName
    );
    if (domainNames.includes(email)) {
      throw new CustomException(
        ErrorCode.DOMAIN_NAME_NOT_ALLOWED.key,
        HttpStatus.BAD_REQUEST
      );
    }
    // Route to appropriate booking type handler
    switch (type) {
      case WhitelistType.HOUR:
        return await this.createHourlyBooking(request);
      case WhitelistType.DATE:
        return await this.createDateBooking(request);
      case WhitelistType.PERMANENT:
        return await this.createPermanentBooking(request);
      default:
        throw new CustomException(
          ErrorCode.CLIENT_ERROR.key,
          HttpStatus.BAD_REQUEST
        );
    }
  }

  private async createHourlyBooking(
    request: CreateWhitelistRequest
  ): Promise<CreateWhitelistResponse> {
    const {
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      duration,
      comments,
    } = request;

    // Validate required fields for hourly booking
    if (!duration) {
      throw new CustomException(
        ErrorCode.CLIENT_ERROR.key,
        HttpStatus.BAD_REQUEST
      );
    }

    if (duration <= 0) {
      throw new CustomException(
        ErrorCode.INVALID_DURATION.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Calculate start and end dates for hourly booking
    const startDateObj = new Date(); // Current date
    const endDateObj = new Date(
      startDateObj.getTime() + duration * 60 * 60 * 1000
    ); // duration in hours

    const whitelist = await this.whitelistRepository.save({
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      whitelistType: WhitelistType.HOUR,
      comments,
      duration,
      startDate: startDateObj,
      endDate: endDateObj,
      status: WhitelistStatus.ACTIVE,
    });

    return {
      id: whitelist.id,
      registrationNumber: whitelist.registrationNumber,
      email: whitelist.email,
    };
  }

  private async createDateBooking(
    request: CreateWhitelistRequest
  ): Promise<CreateWhitelistResponse> {
    const {
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      startDate,
      endDate,
      comments,
    } = request;

    // Validate required fields for date booking
    if (!endDate) {
      throw new CustomException(
        ErrorCode.CLIENT_ERROR.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Calculate start and end dates for date booking
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj >= endDateObj) {
      throw new CustomException(
        ErrorCode.INVALID_DATE_RANGE.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const whitelist = await this.whitelistRepository.save({
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      whitelistType: WhitelistType.DATE,
      comments,
      startDate: startDateObj,
      endDate: endDateObj,
      status: WhitelistStatus.ACTIVE,
    });

    return {
      id: whitelist.id,
      registrationNumber: whitelist.registrationNumber,
      email: whitelist.email,
    };
  }

  private async createPermanentBooking(
    request: CreateWhitelistRequest
  ): Promise<CreateWhitelistResponse> {
    const { registrationNumber, email, subCarParkId, tenancyId, comments } =
      request;

    // Calculate start and end dates for permanent booking
    const startDateObj = new Date(); // Current date
    const endDateObj = new Date(
      startDateObj.getTime() + 5 * 365 * 24 * 60 * 60 * 1000
    ); // 5 years from now

    const whitelist = await this.whitelistRepository.save({
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      comments,
      whitelistType: WhitelistType.PERMANENT,
      startDate: startDateObj,
      endDate: endDateObj,
      status: WhitelistStatus.ACTIVE,
    });

    return {
      id: whitelist.id,
      registrationNumber: whitelist.registrationNumber,
      email: whitelist.email,
    };
  }

  async update(
    id: string,
    request: UpdateWhitelistRequest
  ): Promise<UpdateWhitelistResponse> {
    const entity = await this.whitelistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.WHITELIST_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    const isBlacklisted =
      await this.blacklistService.isRegistrationNumberBlacklistedInSubCarPark(
        entity.registrationNumber,
        entity.subCarParkId
      );
    if (isBlacklisted) {
      throw new CustomException(
        ErrorCode.REGISTRATION_NUMBER_BLACKLISTED_IN_SUB_CAR_PARK.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const { type } = request;

    // Route to appropriate booking type handler
    switch (type) {
      case WhitelistType.HOUR:
        return await this.updateHourlyBooking(id, request);
      case WhitelistType.DATE:
        return await this.updateDateBooking(id, request);
      case WhitelistType.PERMANENT:
        return await this.updatePermanentBooking(id, request);
      default:
        throw new CustomException(
          ErrorCode.CLIENT_ERROR.key,
          HttpStatus.BAD_REQUEST
        );
    }
  }

  private async updateHourlyBooking(
    id: string,
    request: UpdateWhitelistRequest
  ): Promise<UpdateWhitelistResponse> {
    const { subCarParkId, tenancyId, duration } = request;

    // Validate required fields for hourly booking
    if (duration !== undefined && duration <= 0) {
      throw new CustomException(
        ErrorCode.INVALID_DURATION.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate subCarPark if provided
    if (subCarParkId) {
      const subCarPark = await this.subCarParkService.findOne({
        where: { id: subCarParkId },
      });
      if (!subCarPark) {
        throw new CustomException(
          ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
          HttpStatus.NOT_FOUND
        );
      }
    }

    // Validate tenancy if provided
    if (tenancyId) {
      const tenancy = await this.tenancyService.findOne({
        where: { id: tenancyId },
      });
      if (!tenancy) {
        throw new CustomException(
          ErrorCode.TENANCY_NOT_FOUND.key,
          HttpStatus.NOT_FOUND
        );
      }
    }

    // Get existing entity
    const entity = await this.whitelistRepository.findOne({ where: { id } });

    // Calculate new dates if duration is provided
    let startDateObj = entity.startDate;
    let endDateObj = entity.endDate;

    if (duration !== undefined) {
      startDateObj = new Date(); // Current date
      endDateObj = new Date(startDateObj.getTime() + duration * 60 * 60 * 1000); // duration in hours
    }

    // Update entity
    Object.assign(entity, {
      ...request,
      startDate: startDateObj,
      endDate: endDateObj,
      duration: duration,
      whitelistType: WhitelistType.HOUR,
    });

    const updatedEntity = await this.whitelistRepository.save(entity);

    return {
      id: updatedEntity.id,
      registrationNumber: updatedEntity.registrationNumber,
      email: updatedEntity.email,
    };
  }

  private async updateDateBooking(
    id: string,
    request: UpdateWhitelistRequest
  ): Promise<UpdateWhitelistResponse> {
    const { subCarParkId, tenancyId, endDate, startDate } = request;

    // Validate subCarPark if provided
    if (subCarParkId) {
      const subCarPark = await this.subCarParkService.findOne({
        where: { id: subCarParkId },
      });
      if (!subCarPark) {
        throw new CustomException(
          ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
          HttpStatus.NOT_FOUND
        );
      }
    }

    // Validate tenancy if provided
    if (tenancyId) {
      const tenancy = await this.tenancyService.findOne({
        where: { id: tenancyId },
      });
      if (!tenancy) {
        throw new CustomException(
          ErrorCode.TENANCY_NOT_FOUND.key,
          HttpStatus.NOT_FOUND
        );
      }
    }

    // Get existing entity
    const entity = await this.whitelistRepository.findOne({ where: { id } });

    // Calculate new dates if endDate is provided
    let startDateObj = entity.startDate;
    let endDateObj = entity.endDate;

    if (endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);

      console.log(startDateObj, endDateObj);

      if (startDateObj >= endDateObj) {
        throw new CustomException(
          ErrorCode.INVALID_DATE_RANGE.key,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    // Update entity
    Object.assign(entity, {
      ...request,
      startDate: startDateObj,
      endDate: endDateObj,
      whitelistType: WhitelistType.DATE,
    });

    const updatedEntity = await this.whitelistRepository.save(entity);

    return {
      id: updatedEntity.id,
      registrationNumber: updatedEntity.registrationNumber,
      email: updatedEntity.email,
    };
  }

  private async updatePermanentBooking(
    id: string,
    request: UpdateWhitelistRequest
  ): Promise<UpdateWhitelistResponse> {
    const { subCarParkId, tenancyId } = request;

    // Validate subCarPark if provided
    if (subCarParkId) {
      const subCarPark = await this.subCarParkService.findOne({
        where: { id: subCarParkId },
      });
      if (!subCarPark) {
        throw new CustomException(
          ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
          HttpStatus.NOT_FOUND
        );
      }
    }

    // Validate tenancy if provided
    if (tenancyId) {
      const tenancy = await this.tenancyService.findOne({
        where: { id: tenancyId },
      });
      if (!tenancy) {
        throw new CustomException(
          ErrorCode.TENANCY_NOT_FOUND.key,
          HttpStatus.NOT_FOUND
        );
      }
    }

    // Get existing entity
    const entity = await this.whitelistRepository.findOne({ where: { id } });

    // Calculate new dates for permanent booking
    const startDateObj = new Date(); // Current date
    const endDateObj = new Date(
      startDateObj.getTime() + 5 * 365 * 24 * 60 * 60 * 1000
    ); // 5 year from now

    // Update entity
    Object.assign(entity, {
      ...request,
      startDate: startDateObj,
      endDate: endDateObj,
      whitelistType: WhitelistType.PERMANENT,
    });

    const updatedEntity = await this.whitelistRepository.save(entity);

    return {
      id: updatedEntity.id,
      registrationNumber: updatedEntity.registrationNumber,
      email: updatedEntity.email,
    };
  }

  async remove(id: string): Promise<WhitelistDeleteResponse> {
    const entity = await this.whitelistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.WHITELIST_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    const registrationNumber = entity.registrationNumber;
    const email = entity.email;
    await this.whitelistRepository.softRemove(entity);

    return {
      id,
      registrationNumber,
      email,
      message: "Whitelist entry removed successfully",
      deletedAt: new Date(),
    };
  }

  async bulkRemove(ids: string[]): Promise<BulkDeleteWhitelistResponse> {
    const deletedIds: string[] = [];
    const failedIds: { id: string; reason: string }[] = [];

    for (const id of ids) {
      try {
        const entity = await this.whitelistRepository.findOne({
          where: { id },
        });

        if (!entity) {
          failedIds.push({
            id,
            reason: "Whitelist entry not found",
          });
          continue;
        }

        await this.whitelistRepository.softRemove(entity);
        deletedIds.push(id);
      } catch (error) {
        failedIds.push({
          id,
          reason: error.message || "Unknown error occurred",
        });
      }
    }

    const totalDeleted = deletedIds.length;
    const totalFailed = failedIds.length;

    let message = `Bulk delete completed: ${totalDeleted} deleted`;
    if (totalFailed > 0) {
      message += `, ${totalFailed} failed`;
    }

    return {
      deletedIds,
      failedIds,
      message,
      deletedAt: new Date(),
    };
  }

  async checkout(id: string): Promise<void> {
    const entity = await this.whitelistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.WHITELIST_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    if (entity.status === WhitelistStatus.CHECKOUT) {
      throw new CustomException(
        ErrorCode.BOOKING_ALREADY_COMPLETED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    entity.status = WhitelistStatus.CHECKOUT;
    await this.whitelistRepository.save(entity);
  }

  async exportToCsv(request: FindWhitelistRequest): Promise<string> {
    const { search, sortField, sortOrder, type, subCarParkId, dateFrom, dateTo } = request;

    const whereOptions: FindOptionsWhere<Whitelist> = {};
    const orderOptions: FindOptionsOrder<Whitelist> = {};

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    if (type) {
      whereOptions.whitelistType = type;
    }

    if (subCarParkId) {
      whereOptions.subCarParkId = subCarParkId;
    }

    if (dateFrom && dateTo) {
      whereOptions.startDate = Between(new Date(dateFrom), new Date(dateTo));
    }

    const query: FindManyOptions<Whitelist> = {
      where: search
        ? [
            { ...whereOptions, email: ILike(`%${search}%`) },
            { ...whereOptions, registrationNumber: ILike(`%${search}%`) },
          ]
        : whereOptions,
      order: orderOptions,
      relations: {
        subCarPark: true,
        tenancy: true,
      },
    };

    const whitelists = await this.whitelistRepository.find(query);

    // CSV Headers
    const headers = [
      "ID",
      "Registration Number",
      "Email",
      "Start Date",
      "End Date",
      "Type",
      "Car Park Name",
      "Tenancy Name",
      "Status",
      "Created At",
    ];

    // Convert data to CSV format
    const csvRows = whitelists.map((item) => [
      item.id,
      item.registrationNumber,
      item.email,
      item.startDate?.toISOString().split("T")[0] || "",
      item.endDate?.toISOString().split("T")[0] || "",
      item.whitelistType,
      item.subCarPark?.carParkName || "",
      item.tenancy?.tenantName || "",
      item.status,
      item.createdAt.toISOString(),
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvRows]
      .map((row) =>
        row
          .map((field) =>
            typeof field === "string" &&
            (field.includes(",") || field.includes('"') || field.includes("\n"))
              ? `"${field.replace(/"/g, '""')}"`
              : field
          )
          .join(",")
      )
      .join("\n");

    return csvContent;
  }
}
