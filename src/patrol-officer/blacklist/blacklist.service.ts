import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
} from "typeorm";
import { Blacklist } from "../../blacklist/entities/blacklist-reg.entity";
import {
  CreateBlacklistRequest,
  CreateBlacklistResponse,
  FindBlacklistRequest,
  FindBlacklistResponse,
  UpdateBlacklistRequest,
  UpdateBlacklistResponse,
  BlacklistDeleteResponse,
  BulkDeleteBlacklistResponse,
} from "./blacklist.dto";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { ApiGetBaseResponse } from "../../common/types";
import { BaseService } from "../../common/base.service";
import { ConfigService } from "@nestjs/config";
import { RequestContextService } from "../../common/services/request-context/request-context.service";
import { DataSource } from "typeorm";
import { PatrolOfficer } from "../entities/patrol-officer.entity";
import { GetAssignedSubCarParksResponse } from "./blacklist.dto";

@Injectable()
export class BlacklistService extends BaseService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,
    @InjectRepository(PatrolOfficer)
    private readonly patrolOfficerRepository: Repository<PatrolOfficer>,
    requestContextService: RequestContextService,
    configService: ConfigService,
    datasource: DataSource
  ) {
    super(
      requestContextService,
      configService,
      datasource,
      BlacklistService.name
    );
  }

  async create(
    request: CreateBlacklistRequest
  ): Promise<CreateBlacklistResponse> {
    const { registrationNumber, email, comments, subCarParkId } = request;

    // Check if the user has access to this sub car park
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === subCarParkId
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN
      );
    }

    const savedBlacklist = await this.blacklistRepository.save({
      registrationNumber,
      email,
      comments,
      subCarParkId,
    });

    return {
      id: savedBlacklist.id,
      registrationNumber: savedBlacklist.registrationNumber,
      email: savedBlacklist.email,
      comments: savedBlacklist.comments,
    };
  }

  async findAll(
    request: FindBlacklistRequest
  ): Promise<ApiGetBaseResponse<FindBlacklistResponse>> {
    const {
      search,
      dateFrom,
      dateTo,
      sortField,
      sortOrder,
      pageNo,
      pageSize,
      subCarParkId,
    } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<Blacklist> = {};
    const orderOptions: FindOptionsOrder<Blacklist> = {};

    // Filter by assigned sub car parks
    const assignedSubCarParks = await this.getAssignedSubCarParks();
    if (assignedSubCarParks.length > 0) {
      const subCarParkIds = assignedSubCarParks.map(
        (subCarPark) => subCarPark.subCarParkId
      );
      if (subCarParkId) {
        if (!subCarParkIds.includes(subCarParkId)) {
          throw new CustomException(
            ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
            HttpStatus.FORBIDDEN
          );
        }
        whereOptions.subCarParkId = subCarParkId;
      } else {
        whereOptions.subCarParkId = In(subCarParkIds);
      }
    }

    if (dateFrom && dateTo) {
      whereOptions.createdAt = Between(dateFrom, dateTo);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const [blacklist, totalItems] = await this.blacklistRepository.findAndCount(
      {
        where: search
          ? [
              { ...whereOptions, registrationNumber: ILike(`%${search}%`) },
              { ...whereOptions, email: ILike(`%${search}%`) },
            ]
          : whereOptions,
        order: orderOptions,
        relations: {
          subCarPark: true,
        },
        skip,
        take,
      }
    );

    let response: FindBlacklistResponse[] = [];
    response = blacklist.map((blacklist) => ({
      id: blacklist.id,
      registrationNumber: blacklist.registrationNumber,
      email: blacklist.email,
      subCarPark: {
        id: blacklist.subCarPark.id,
        subCarParkName: blacklist.subCarPark.carParkName,
      },
      createdAt: blacklist.createdAt,
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

  async findOne(options: FindOneOptions<Blacklist>): Promise<Blacklist> {
    const entity = await this.blacklistRepository.findOne(options);
    if (!entity) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if the user has access to this blacklist entry
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === entity.subCarParkId
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN
      );
    }

    return entity;
  }

  async update(
    id: string,
    request: UpdateBlacklistRequest
  ): Promise<UpdateBlacklistResponse> {
    const entity = await this.blacklistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if the user has access to this blacklist entry
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === entity.subCarParkId
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN
      );
    }

    const updatedEntity = await this.blacklistRepository.save({
      ...entity,
      ...request,
    });

    return {
      id: updatedEntity.id,
      registrationNumber: updatedEntity.registrationNumber,
      email: updatedEntity.email,
      comments: updatedEntity.comments,
    };
  }

  async remove(id: string): Promise<BlacklistDeleteResponse> {
    const entity = await this.blacklistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if the user has access to this blacklist entry
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === entity.subCarParkId
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN
      );
    }

    const registrationNumber = entity.registrationNumber;
    const email = entity.email;
    await this.blacklistRepository.softRemove(entity);

    return {
      id,
      registrationNumber,
      email,
      message: "Blacklist entry removed successfully",
      deletedAt: new Date(),
    };
  }

  async bulkRemove(ids: string[]): Promise<BulkDeleteBlacklistResponse> {
    const deletedIds: string[] = [];
    const failedIds: { id: string; reason: string }[] = [];

    // Get assigned sub car parks once for efficiency
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    const assignedSubCarParkIdSet = new Set(
      assignedSubCarParkIds.map((subCarPark) => subCarPark.subCarParkId)
    );

    for (const id of ids) {
      try {
        const entity = await this.blacklistRepository.findOne({ where: { id } });

        if (!entity) {
          failedIds.push({
            id,
            reason: "Blacklist entry not found",
          });
          continue;
        }

        // Check if the user has access to this blacklist entry
        if (!assignedSubCarParkIdSet.has(entity.subCarParkId)) {
          failedIds.push({
            id,
            reason: "Sub car park not assigned to user",
          });
          continue;
        }

        await this.blacklistRepository.softRemove(entity);
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

  async getAssignedSubCarParks(): Promise<GetAssignedSubCarParksResponse[]> {
    const userId = this.authenticatedUser.id;

    if (!userId) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    const patrolOfficer = await this.patrolOfficerRepository.findOne({
      where: { userId: userId },
      relations: {
        patrolOfficerBlacklistSubCarParks: {
          subCarPark: true,
        },
      },
    });

    if (!patrolOfficer) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    // Collect all assigned sub car park IDs from all assignment types
    const assignedSubCarParkIds = new Set<string>();

    // Add blacklist assignments
    patrolOfficer.patrolOfficerBlacklistSubCarParks?.forEach((assignment) => {
      if (assignment.subCarPark?.id) {
        assignedSubCarParkIds.add(assignment.subCarPark.id);
      }
    });

    return patrolOfficer.patrolOfficerBlacklistSubCarParks?.map(
      (assignment) => ({
        subCarParkId: assignment.subCarPark.id,
        subCarParkName: assignment.subCarPark.carParkName,
      })
    );
  }

  async exportToCsv(request: FindBlacklistRequest): Promise<string> {
    const { search, dateFrom, dateTo, sortField, sortOrder, subCarParkId } =
      request;

    const whereOptions: FindOptionsWhere<Blacklist> = {};
    const orderOptions: FindOptionsOrder<Blacklist> = {};

    // Filter by assigned sub car parks
    const assignedSubCarParks = await this.getAssignedSubCarParks();
    if (assignedSubCarParks.length > 0) {
      const subCarParkIds = assignedSubCarParks.map(
        (subCarPark) => subCarPark.subCarParkId
      );
      if (subCarParkId) {
        if (!subCarParkIds.includes(subCarParkId)) {
          throw new CustomException(
            ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
            HttpStatus.FORBIDDEN
          );
        }
        whereOptions.subCarParkId = subCarParkId;
      } else {
        whereOptions.subCarParkId = In(subCarParkIds);
      }
    }

    if (dateFrom && dateTo) {
      whereOptions.createdAt = Between(dateFrom, dateTo);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const query: FindManyOptions<Blacklist> = {
      where: search
        ? [
            { ...whereOptions, registrationNumber: ILike(`%${search}%`) },
            { ...whereOptions, email: ILike(`%${search}%`) },
          ]
        : whereOptions,
      order: orderOptions,
      relations: {
        subCarPark: true,
      },
    };

    const blacklist = await this.blacklistRepository.find(query);

    // CSV Headers
    const headers = [
      "ID",
      "Registration Number",
      "Email",
      "Sub Car Park Name",
      "Comments",
      "Created At",
    ];

    // Convert data to CSV format
    const csvRows = blacklist.map((item) => [
      item.id,
      item.registrationNumber,
      item.email,
      item.subCarPark?.carParkName || "",
      item.comments || "",
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
