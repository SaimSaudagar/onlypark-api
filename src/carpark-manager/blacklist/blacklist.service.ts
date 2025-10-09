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
  GetAssignedSubCarParksResponse,
} from "./blacklist.dto";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { ApiGetBaseResponse } from "../../common/types";
import { BaseService } from "../../common/base.service";
import { ConfigService } from "@nestjs/config";
import { RequestContextService } from "../../common/services/request-context/request-context.service";
import { DataSource } from "typeorm";
import { CarparkManager } from "../entities/carpark-manager.entity";

@Injectable()
export class BlacklistService extends BaseService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,
    @InjectRepository(CarparkManager)
    private readonly carparkManagerRepository: Repository<CarparkManager>,
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

  async remove(id: string): Promise<void> {
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

    await this.blacklistRepository.delete(id);
  }

  async getAssignedSubCarParks(): Promise<GetAssignedSubCarParksResponse[]> {
    const userId = this.authenticatedUser.id;

    if (!userId) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    const carparkManager = await this.carparkManagerRepository.findOne({
      where: { userId: userId },
      relations: {
        carparkManagerBlacklistSubCarParks: {
          subCarPark: true,
        },
      },
    });

    if (!carparkManager) {
      throw new CustomException(
        ErrorCode.CARPARK_MANAGER_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    return (
      carparkManager.carparkManagerBlacklistSubCarParks?.map((assignment) => ({
        subCarParkId: assignment.subCarPark.id,
        subCarParkName: assignment.subCarPark.carParkName,
      })) || []
    );
  }
}
