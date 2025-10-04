import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { VisitorBooking } from '../../visitor-booking/entities/visitor-booking.entity';
import {
    CreateVisitorBookingRequest,
    VisitorBookingResponse,
    VisitorBookingCreateResponse,
    VisitorBookingDeleteResponse,
    FindVisitorBookingResponse,
    FindVisitorBookingRequest,
} from './visitor-booking.dto';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { BookingStatus } from '../../common/enums';
import { TenancyService } from '../../tenancy/tenancy.service';
import { SubCarParkService } from '../sub-car-park/sub-car-park.service';
import { ApiGetBaseResponse } from '../../common';

@Injectable()
export class VisitorBookingService {
    constructor(
        @InjectRepository(VisitorBooking)
        private visitorBookingRepository: Repository<VisitorBooking>,
        private tenancyService: TenancyService,
        private subCarParkService: SubCarParkService,
    ) { }

    async create(request: CreateVisitorBookingRequest): Promise<VisitorBookingCreateResponse> {
        const {
            referenceNumber,
            subCarParkId,
            registrationNumber,
            email,
            timeTo,
            timeFrom,
            comments,
            tenancyId,
        } = request;

        const startDate = new Date(timeFrom);
        const endDate = new Date(timeTo);

        if (startDate >= endDate) {
            throw new CustomException(
                ErrorCode.INVALID_BOOKING_DATES.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        if (durationHours > 24) {
            throw new CustomException(
                ErrorCode.BOOKING_DURATION_EXCEEDED.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (tenancyId) {
            const tenancy = await this.tenancyService.findOne({
                where: { id: tenancyId },
            });

            if (!tenancy) {
                throw new CustomException(
                    ErrorCode.TENANT_NOT_FOUND.key,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        const subCarPark = await this.subCarParkService.findOne({
            where: { id: subCarParkId },
        });

        if (!subCarPark) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const existingBooking = await this.visitorBookingRepository
            .createQueryBuilder('visitorBooking')
            .where('visitorBooking.registrationNumber = :registrationNumber', { registrationNumber: registrationNumber })
            .andWhere('visitorBooking.status = :status', { status: BookingStatus.ACTIVE })
            .andWhere('visitorBooking.startTime <= :endTime', { endTime: timeTo })
            .andWhere('visitorBooking.endTime >= :startTime', { startTime: timeFrom })
            .getOne();

        if (existingBooking) {
            throw new CustomException(
                ErrorCode.BOOKING_TIME_CONFLICT.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check capacity (simplified - in real app, this would be more complex)
        const activeBookingsCount = await this.visitorBookingRepository
            .createQueryBuilder('visitorBooking')
            .where('visitorBooking.subCarParkId = :subCarParkId', { subCarParkId: subCarPark.id })
            .andWhere('visitorBooking.status = :status', { status: BookingStatus.ACTIVE })
            .andWhere('visitorBooking.startTime <= :endTime', { endTime: timeTo })
            .andWhere('visitorBooking.endTime >= :startTime', { startTime: timeFrom })
            .getCount();

        if (activeBookingsCount >= subCarPark.carSpace) {
            throw new CustomException(
                ErrorCode.BOOKING_CAPACITY_EXCEEDED.key,
                HttpStatus.BAD_REQUEST,
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
            status: BookingStatus.ACTIVE,
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

    async findAll(request: FindVisitorBookingRequest): Promise<ApiGetBaseResponse<FindVisitorBookingResponse>> {
        const { search, sortField, sortOrder, pageNo, pageSize, status } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<VisitorBooking> = {};
        const orderOptions: FindOptionsOrder<VisitorBooking> = {};

        if (search) {
            whereOptions.registrationNumber = ILike(`%${search}%`);
            whereOptions.email = ILike(`%${search}%`);
        }   

        if (status) {
            whereOptions.status = status;
        }

        if (sortField) {
            orderOptions[sortField] = sortOrder;
        }

        const [visitorBookings, totalItems] = await this.visitorBookingRepository.findAndCount({
            ...whereOptions,
            order: orderOptions,
            skip,
            take,
            relations: {
                tenancy: true,
                subCarPark: true,
            },
        });

        const response = visitorBookings.map(visitorBooking => ({
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

    async findOne(options?: FindOneOptions<VisitorBooking>): Promise<VisitorBookingResponse | null> {
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
            tenancy: visitorBooking.tenancy ? {
                id: visitorBooking.tenancy.id,
                tenantName: visitorBooking.tenancy.tenantName,
                tenantEmail: visitorBooking.tenancy.tenantEmail,
            } : undefined,
            subCarParkId: visitorBooking.subCarParkId,
            subCarPark: visitorBooking.subCarPark ? {
                id: visitorBooking.subCarPark.id,
                carParkName: visitorBooking.subCarPark.carParkName,
                subCarParkCode: visitorBooking.subCarPark.subCarParkCode,
                location: visitorBooking.subCarPark.location,
                carSpace: visitorBooking.subCarPark.carSpace,
            } : undefined,
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
                HttpStatus.BAD_REQUEST,
            );
        }

        if (visitorBooking.status === BookingStatus.CHECKOUT) {
            throw new CustomException(
                ErrorCode.BOOKING_ALREADY_COMPLETED.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const email = visitorBooking.email;
        const registrationNumber = visitorBooking.registrationNumber;
        await this.visitorBookingRepository.remove(visitorBooking);

        return {
            id,
            email,
            registrationNumber,
            message: 'Visitor booking deleted successfully',
            deletedAt: new Date(),
        };
    }

    private isValidregistrationNumberistration(registrationNumber: string): boolean {
        // Basic validation - can be enhanced based on requirements
        const regex = /^[A-Z0-9]{1,10}$/i;
        return regex.test(registrationNumber) && registrationNumber.length >= 3;
    }
}
