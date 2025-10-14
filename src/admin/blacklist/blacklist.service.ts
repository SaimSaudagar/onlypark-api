import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
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
import { HttpStatus } from "@nestjs/common";
import { ApiGetBaseResponse } from "../../common/types";
import { SubCarParkService } from "../sub-car-park/sub-car-park.service";

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,
    private readonly subCarParkService: SubCarParkService
  ) {}

  async create(
    request: CreateBlacklistRequest
  ): Promise<CreateBlacklistResponse> {
    const { registrationNumber, email, comments, subCarParkId } = request;

    const subCarPark = await this.subCarParkService.exists(subCarParkId);
    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const existingBlacklist = await this.blacklistRepository.findOne({
      where: { registrationNumber, email, subCarParkId },
    });
    if (existingBlacklist) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST
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

    if (dateFrom && dateTo) {
      whereOptions.createdAt = Between(dateFrom, dateTo);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    if (subCarParkId) {
      whereOptions.subCarParkId = subCarParkId;
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
      skip,
      take,
    };

    const [blacklist, totalItems] =
      await this.blacklistRepository.findAndCount(query);

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

    const subCarPark = await this.subCarParkService.exists(
      request.subCarParkId
    );
    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    entity.registrationNumber = request.registrationNumber;
    entity.email = request.email;
    entity.subCarParkId = request.subCarParkId;
    entity.comments = request.comments;

    const updatedEntity = await this.blacklistRepository.save(entity);

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

  async isRegistrationNumberBlacklistedInSubCarPark(
    registrationNumber: string,
    subCarParkId: string
  ): Promise<boolean> {
    const entity = await this.blacklistRepository.findOne({
      where: { registrationNumber, subCarParkId },
    });
    return !!entity;
  }

  async exportToCsv(request: FindBlacklistRequest): Promise<string> {
    const { search, dateFrom, dateTo, sortField, sortOrder, subCarParkId } =
      request;

    const whereOptions: FindOptionsWhere<Blacklist> = {};
    const orderOptions: FindOptionsOrder<Blacklist> = {};

    if (dateFrom && dateTo) {
      whereOptions.createdAt = Between(dateFrom, dateTo);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    if (subCarParkId) {
      whereOptions.subCarParkId = subCarParkId;
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
