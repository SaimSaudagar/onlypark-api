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
import { VisitorBooking } from "../../visitor-booking/entities/visitor-booking.entity";
import {
  CreateVisitorRequest,
  CreateVisitorResponse,
  FindVisitorRequest,
  FindVisitorResponse,
  UpdateVisitorRequest,
  UpdateVisitorResponse,
  GetAssignedSubCarParksResponse,
} from "./visitor.dto";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { ApiGetBaseResponse } from "../../common/types";
import { BaseService } from "../../common/base.service";
import { ConfigService } from "@nestjs/config";
import { RequestContextService } from "../../common/services/request-context/request-context.service";
import { DataSource } from "typeorm";
import { CarparkManager } from "../entities/carpark-manager.entity";
import { VisitorBookingStatus } from "../../common/enums";
import * as crypto from "crypto";

@Injectable()
export class VisitorService extends BaseService {
  constructor(
    @InjectRepository(VisitorBooking)
    private readonly visitorBookingRepository: Repository<VisitorBooking>,
    @InjectRepository(CarparkManager)
    private readonly carparkManagerRepository: Repository<CarparkManager>,
    requestContextService: RequestContextService,
    configService: ConfigService,
    datasource: DataSource,
  ) {
    super(
      requestContextService,
      configService,
      datasource,
      VisitorService.name,
    );
  }

  async create(request: CreateVisitorRequest): Promise<CreateVisitorResponse> {
    const {
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      startDate,
      endDate,
      status,
    } = request;

    // Check if the user has access to this sub car park
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === subCarParkId,
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN,
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    const savedVisitor = await this.visitorBookingRepository.save({
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      startDate,
      endDate,
      status: status || VisitorBookingStatus.ACTIVE,
      token,
    });

    return {
      id: savedVisitor.id,
      registrationNumber: savedVisitor.registrationNumber,
      email: savedVisitor.email,
      startDate: savedVisitor.startDate,
      endDate: savedVisitor.endDate,
      status: savedVisitor.status,
      token: savedVisitor.token,
    };
  }

  async findAll(
    request: FindVisitorRequest,
  ): Promise<ApiGetBaseResponse<FindVisitorResponse>> {
    const {
      search,
      dateFrom,
      dateTo,
      status,
      sortField,
      sortOrder,
      pageNo,
      pageSize,
    } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<VisitorBooking>[] = [];
    const orderOptions: FindOptionsOrder<VisitorBooking> = {};

    // Filter by assigned sub car parks
    const assignedSubCarParks = await this.getAssignedSubCarParks();
    if (assignedSubCarParks.length > 0) {
      const subCarParkIds = assignedSubCarParks.map(
        (subCarPark) => subCarPark.subCarParkId,
      );
      whereOptions.push({ subCarParkId: In(subCarParkIds) });
    }

    if (dateFrom && dateTo) {
      whereOptions.push({ startDate: Between(dateFrom, dateTo) });
    }

    if (search) {
      whereOptions.push(
        { registrationNumber: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      );
    }

    if (status) {
      whereOptions.push({ status });
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const query: FindManyOptions<VisitorBooking> = {
      where: whereOptions,
      order: orderOptions,
      relations: {
        subCarPark: true,
        tenancy: true,
      },
      skip,
      take,
    };

    const [visitorBookings, totalItems] =
      await this.visitorBookingRepository.findAndCount(query);

    let response: FindVisitorResponse[] = [];
    response = visitorBookings.map((visitor) => ({
      id: visitor.id,
      registrationNumber: visitor.registrationNumber,
      email: visitor.email,
      startDate: visitor.startDate,
      endDate: visitor.endDate,
      status: visitor.status,
      token: visitor.token,
      createdAt: visitor.createdAt,
      subCarPark: {
        id: visitor.subCarPark.id,
        carParkName: visitor.subCarPark.carParkName,
      },
      tenancy: {
        id: visitor.tenancy.id,
        tenantName: visitor.tenancy.tenantName,
      },
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

  async findOne(
    options: FindOneOptions<VisitorBooking>,
  ): Promise<VisitorBooking> {
    const entity = await this.visitorBookingRepository.findOne(options);
    if (!entity) {
      throw new CustomException(
        ErrorCode.VISITOR_BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the user has access to this visitor booking
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === entity.subCarParkId,
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN,
      );
    }

    return entity;
  }

  async update(
    id: string,
    request: UpdateVisitorRequest,
  ): Promise<UpdateVisitorResponse> {
    const entity = await this.visitorBookingRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new CustomException(
        ErrorCode.VISITOR_BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the user has access to this visitor booking
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === entity.subCarParkId,
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedEntity = await this.visitorBookingRepository.save({
      ...entity,
      ...request,
    });

    return {
      id: updatedEntity.id,
      registrationNumber: updatedEntity.registrationNumber,
      email: updatedEntity.email,
      startDate: updatedEntity.startDate,
      endDate: updatedEntity.endDate,
      status: updatedEntity.status,
      token: updatedEntity.token,
    };
  }

  async remove(id: string): Promise<void> {
    const entity = await this.visitorBookingRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new CustomException(
        ErrorCode.VISITOR_BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the user has access to this visitor booking
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === entity.subCarParkId,
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN,
      );
    }

    await this.visitorBookingRepository.delete(id);
  }

  async getAssignedSubCarParks(): Promise<GetAssignedSubCarParksResponse[]> {
    const userId = this.authenticatedUser.id;

    if (!userId) {
      throw new CustomException(
        ErrorCode.USER_NOT_FOUND.key,
        HttpStatus.NOT_FOUND,
      );
    }

    const carparkManager = await this.carparkManagerRepository.findOne({
      where: { userId: userId },
      relations: {
        carparkManagerVisitorSubCarParks: {
          subCarPark: true,
        },
      },
    });

    if (!carparkManager) {
      throw new CustomException(
        ErrorCode.CARPARK_MANAGER_NOT_FOUND.key,
        HttpStatus.NOT_FOUND,
      );
    }

    return (
      carparkManager.carparkManagerVisitorSubCarParks?.map((assignment) => ({
        subCarParkId: assignment.subCarPark.id,
        subCarParkName: assignment.subCarPark.carParkName,
      })) || []
    );
  }

  async checkout(id: string): Promise<void> {
    const visitorBooking = await this.visitorBookingRepository.findOne({
      where: { id },
    });

    if (!visitorBooking) {
      throw new CustomException(
        ErrorCode.VISITOR_BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the user has access to this visitor booking
    const assignedSubCarParkIds = await this.getAssignedSubCarParks();
    if (
      !assignedSubCarParkIds.some(
        (subCarPark) => subCarPark.subCarParkId === visitorBooking.subCarParkId,
      )
    ) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
        HttpStatus.FORBIDDEN,
      );
    }

    if (visitorBooking.status === VisitorBookingStatus.CHECKOUT) {
      throw new CustomException(
        ErrorCode.BOOKING_ALREADY_COMPLETED.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    visitorBooking.status = VisitorBookingStatus.CHECKOUT;
    await this.visitorBookingRepository.save(visitorBooking);
  }
}
