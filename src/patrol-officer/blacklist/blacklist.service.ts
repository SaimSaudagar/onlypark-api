import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
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
    const { regNo, email, comments, subCarParkId } = request;

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
      regNo,
      email,
      comments,
      subCarParkId,
    });

    return {
      id: savedBlacklist.id,
      regNo: savedBlacklist.regNo,
      email: savedBlacklist.email,
      comments: savedBlacklist.comments,
    };
  }

  async findAll(
    request: FindBlacklistRequest
  ): Promise<ApiGetBaseResponse<FindBlacklistResponse>> {
    const { search, dateFrom, dateTo, sortField, sortOrder, pageNo, pageSize, subCarParkId } =
      request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<Blacklist>[] = [];
    const orderOptions: FindOptionsOrder<Blacklist> = {};

    // Filter by assigned sub car parks
    const assignedSubCarParks = await this.getAssignedSubCarParks();
    if (assignedSubCarParks.length > 0) {
      const subCarParkIds = assignedSubCarParks.map(
        (subCarPark) => subCarPark.subCarParkId
      );
      whereOptions.push({ subCarParkId: In(subCarParkIds) });
    }

    if (subCarParkId) {
      whereOptions.push({ subCarParkId: subCarParkId });
    }

    if (dateFrom && dateTo) {
      whereOptions.push({ createdAt: Between(dateFrom, dateTo) });
    }

    if (search) {
      whereOptions.push(
        { regNo: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) }
      );
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const [blacklist, totalItems] = await this.blacklistRepository.findAndCount(
      {
        where: whereOptions,
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
      regNo: blacklist.regNo,
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
      regNo: updatedEntity.regNo,
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
}
