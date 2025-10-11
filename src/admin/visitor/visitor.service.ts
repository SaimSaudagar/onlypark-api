import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
  FindManyOptions,
} from "typeorm";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import {
  CreateVisitorBookingRequest,
  VisitorBookingResponse,
  VisitorBookingCreateResponse,
  VisitorBookingDeleteResponse,
  FindVisitorBookingResponse,
  FindVisitorBookingRequest,
} from "./visitor.dto";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { HttpStatus } from "@nestjs/common";
import { VisitorBookingStatus } from "../../common/enums";
import { TenancyService } from "../../tenancy/tenancy.service";
import { SubCarParkService } from "../sub-car-park/sub-car-park.service";
import { ApiGetBaseResponse } from "../../common";

@Injectable()
export class VisitorBookingService {
  constructor(
    @InjectRepository(VisitorBooking)
    private visitorBookingRepository: Repository<VisitorBooking>,
    private tenancyService: TenancyService,
    private subCarParkService: SubCarParkService
  ) {}

  async create(
    request: CreateVisitorBookingRequest
  ): Promise<VisitorBookingCreateResponse> {
    const {
      subCarParkId,
      registrationNumber,
      email,
      timeTo,
      timeFrom,
      tenancyId,
    } = request;

    const startDate = new Date(timeFrom);
    const endDate = new Date(timeTo);

    if (startDate >= endDate) {
      throw new CustomException(
        ErrorCode.INVALID_BOOKING_DATES.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const durationHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (durationHours > 24) {
      throw new CustomException(
        ErrorCode.BOOKING_DURATION_EXCEEDED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    if (tenancyId) {
      const tenancy = await this.tenancyService.findOne({
        where: { id: tenancyId },
      });

      if (!tenancy) {
        throw new CustomException(
          ErrorCode.TENANT_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const subCarPark = await this.subCarParkService.findOne({
      where: { id: subCarParkId },
    });

    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const existingBooking = await this.visitorBookingRepository
      .createQueryBuilder("visitorBooking")
      .where("visitorBooking.registrationNumber = :registrationNumber", {
        registrationNumber: registrationNumber,
      })
      .andWhere("visitorBooking.status = :status", {
        status: VisitorBookingStatus.ACTIVE,
      })
      .andWhere("visitorBooking.startTime <= :endTime", { endTime: timeTo })
      .andWhere("visitorBooking.endTime >= :startTime", { startTime: timeFrom })
      .getOne();

    if (existingBooking) {
      throw new CustomException(
        ErrorCode.BOOKING_TIME_CONFLICT.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check capacity (simplified - in real app, this would be more complex)
    const activeBookingsCount = await this.visitorBookingRepository
      .createQueryBuilder("visitorBooking")
      .where("visitorBooking.subCarParkId = :subCarParkId", {
        subCarParkId: subCarPark.id,
      })
      .andWhere("visitorBooking.status = :status", {
        status: VisitorBookingStatus.ACTIVE,
      })
      .andWhere("visitorBooking.startTime <= :endTime", { endTime: timeTo })
      .andWhere("visitorBooking.endTime >= :startTime", { startTime: timeFrom })
      .getCount();

    if (activeBookingsCount >= subCarPark.carSpace) {
      throw new CustomException(
        ErrorCode.BOOKING_CAPACITY_EXCEEDED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Create booking
    const visitorBooking = await this.visitorBookingRepository.save({
      email,
      registrationNumber: registrationNumber,
      tenancyId,
      subCarParkCode: subCarPark.subCarParkCode,
      subCarParkId: subCarPark.id,
      startTime: timeFrom,
      endTime: timeTo,
      status: VisitorBookingStatus.ACTIVE,
    });

    return {
      id: visitorBooking.id,
      email: visitorBooking.email,
      registrationNumber: visitorBooking.registrationNumber,
      startTime: visitorBooking.startDate.toISOString(),
      endTime: visitorBooking.endDate.toISOString(),
      status: visitorBooking.status,
    };
  }

  async findAll(
    request: FindVisitorBookingRequest
  ): Promise<ApiGetBaseResponse<FindVisitorBookingResponse>> {
    const { search, sortField, sortOrder, pageNo, pageSize, status, subCarParkId } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<VisitorBooking> = {};
    const orderOptions: FindOptionsOrder<VisitorBooking> = {};

    if (status) {
      whereOptions.status = status;
    }

    if (subCarParkId) {
      whereOptions.subCarParkId = subCarParkId;
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const [visitorBookings, totalItems] =
      await this.visitorBookingRepository.findAndCount({
        where: search
          ? [
              { ...whereOptions, registrationNumber: ILike(`%${search}%`) },
              { ...whereOptions, email: ILike(`%${search}%`) },
            ]
          : whereOptions,
        order: orderOptions,
        skip,
        take,
        relations: {
          tenancy: true,
          subCarPark: true,
        },
      });

    const response = visitorBookings.map((visitorBooking) => ({
      id: visitorBooking.id,
      email: visitorBooking.email,
      registrationNumber: visitorBooking.registrationNumber,
      startTime: visitorBooking.startDate.toISOString(),
      endTime: visitorBooking.endDate.toISOString(),
      status: visitorBooking.status,
      tenancyName: visitorBooking.tenancy?.tenantName,
      subCarParkName: visitorBooking.subCarPark?.carParkName,
    }));

    return {
      rows: response,
      pagination: {
        size: pageSize,
        page: pageNo,
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems: totalItems,
      },
    };
  }

  async findOne(
    options?: FindOneOptions<VisitorBooking>
  ): Promise<VisitorBookingResponse | null> {
    const visitorBooking = await this.visitorBookingRepository.findOne({
      ...options,
      relations: {
        tenancy: true,
        subCarPark: true,
      },
    });

    if (!visitorBooking) {
      return null;
    }

    return {
      id: visitorBooking.id,
      email: visitorBooking.email,
      registrationNumber: visitorBooking.registrationNumber,
      tenancyId: visitorBooking.tenancyId,
      tenancy: visitorBooking.tenancy
        ? {
            id: visitorBooking.tenancy.id,
            tenantName: visitorBooking.tenancy.tenantName,
            tenantEmail: visitorBooking.tenancy.tenantEmail,
          }
        : undefined,
      subCarParkId: visitorBooking.subCarParkId,
      subCarPark: visitorBooking.subCarPark
        ? {
            id: visitorBooking.subCarPark.id,
            carParkName: visitorBooking.subCarPark.carParkName,
            subCarParkCode: visitorBooking.subCarPark.subCarParkCode,
            location: visitorBooking.subCarPark.location,
            carSpace: visitorBooking.subCarPark.carSpace,
          }
        : undefined,
      startTime: visitorBooking.startDate.toISOString(),
      endTime: visitorBooking.endDate.toISOString(),
      status: visitorBooking.status,
    };
  }

  async remove(id: string): Promise<VisitorBookingDeleteResponse> {
    const visitorBooking = await this.visitorBookingRepository.findOne({
      where: { id },
    });

    if (!visitorBooking) {
      throw new CustomException(
        ErrorCode.BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    if (visitorBooking.status === VisitorBookingStatus.CHECKOUT) {
      throw new CustomException(
        ErrorCode.BOOKING_ALREADY_COMPLETED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const email = visitorBooking.email;
    const registrationNumber = visitorBooking.registrationNumber;
    await this.visitorBookingRepository.remove(visitorBooking);

    return {
      id,
      email,
      registrationNumber,
      message: "Visitor booking deleted successfully",
      deletedAt: new Date(),
    };
  }

  async checkout(id: string): Promise<void> {
    const visitorBooking = await this.visitorBookingRepository.findOne({
      where: { id },
    });

    if (!visitorBooking) {
      throw new CustomException(
        ErrorCode.BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    if (visitorBooking.status === VisitorBookingStatus.CHECKOUT) {
      throw new CustomException(
        ErrorCode.BOOKING_ALREADY_COMPLETED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    visitorBooking.status = VisitorBookingStatus.CHECKOUT;
    await this.visitorBookingRepository.save(visitorBooking);
  }

  private isValidregistrationNumberistration(
    registrationNumber: string
  ): boolean {
    // Basic validation - can be enhanced based on requirements
    const regex = /^[A-Z0-9]{1,10}$/i;
    return regex.test(registrationNumber) && registrationNumber.length >= 3;
  }

  async exportToCsv(request: FindVisitorBookingRequest): Promise<string> {
    const { search, sortField, sortOrder, subCarParkId, status } = request;

    const whereOptions: FindOptionsWhere<VisitorBooking> = {};
    const orderOptions: FindOptionsOrder<VisitorBooking> = {};

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    if (subCarParkId) {
      whereOptions.subCarParkId = subCarParkId;
    }

    if (status) {
      whereOptions.status = status;
    }

    const query: FindManyOptions<VisitorBooking> = {
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

    const visitorBookings = await this.visitorBookingRepository.find(query);

    // CSV Headers
    const headers = [
      "ID",
      "Registration Number",
      "Email",
      "Start Time",
      "End Time",
      "Car Park Name",
      "Tenancy Name",
      "Status",
      "Created At",
    ];

    // Convert data to CSV format
    const csvRows = visitorBookings.map((item) => [
      item.id,
      item.registrationNumber,
      item.email,
      item.startDate.toISOString(),
      item.endDate.toISOString(),
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
