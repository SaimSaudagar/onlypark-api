import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { SubCarPark } from '../sub-car-park/entities/sub-car-park.entity';
import { Tenancy } from '../tenancy/entities/tenancy.entity';
import {
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingResponse,
  BookingListResponse,
  BookingCreateResponse,
  BookingUpdateResponse,
  BookingDeleteResponse,
  TenancySummary,
  SubCarParkSummary,
} from './booking.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { BookingStatus } from '../common/enums';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(SubCarPark)
    private subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(Tenancy)
    private tenancyRepository: Repository<Tenancy>,
  ) { }

  async create(createDto: CreateBookingRequest): Promise<BookingCreateResponse> {
    const {
      email,
      vehicleReg,
      tenancyId,
      subCarParkCode,
      property,
      startTime,
      endTime,
    } = createDto;

    if (!this.isValidVehicleRegistration(vehicleReg)) {
      throw new CustomException(
        ErrorCode.INVALID_VEHICLE_REGISTRATION.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      throw new CustomException(
        ErrorCode.INVALID_BOOKING_DATES.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (startDate < new Date()) {
      throw new CustomException(
        ErrorCode.BOOKING_PAST_DATE.key,
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
      const tenancy = await this.tenancyRepository.findOne({
        where: { id: tenancyId },
      });

      if (!tenancy) {
        throw new CustomException(
          ErrorCode.TENANT_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const subCarPark = await this.subCarParkRepository.findOne({
      where: { subCarParkCode },
    });

    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.vehicleReg = :vehicleReg', { vehicleReg })
      .andWhere('booking.status = :status', { status: BookingStatus.ACTIVE })
      .andWhere('booking.startTime <= :endTime', { endTime })
      .andWhere('booking.endTime >= :startTime', { startTime })
      .getOne();

    if (existingBooking) {
      throw new CustomException(
        ErrorCode.BOOKING_TIME_CONFLICT.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check capacity (simplified - in real app, this would be more complex)
    const activeBookingsCount = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.subCarParkId = :subCarParkId', { subCarParkId: subCarPark.id })
      .andWhere('booking.status = :status', { status: BookingStatus.ACTIVE })
      .andWhere('booking.startTime <= :endTime', { endTime })
      .andWhere('booking.endTime >= :startTime', { startTime })
      .getCount();

    if (activeBookingsCount >= subCarPark.carSpace) {
      throw new CustomException(
        ErrorCode.BOOKING_CAPACITY_EXCEEDED.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create booking
    const booking = this.bookingRepository.create({
      email,
      vehicleReg,
      tenancyId,
      subCarParkCode,
      subCarParkId: subCarPark.id,
      property,
      startTime,
      endTime,
      status: BookingStatus.ACTIVE,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    return {
      id: savedBooking.id,
      email: savedBooking.email,
      vehicleReg: savedBooking.vehicleReg,
      subCarParkCode: savedBooking.subCarParkCode,
      property: savedBooking.property,
      startTime: savedBooking.startTime,
      endTime: savedBooking.endTime,
      status: savedBooking.status,
      createdAt: savedBooking.createdAt,
      message: 'Booking created successfully',
    };
  }

  async findAll(options?: FindManyOptions<Booking>): Promise<BookingListResponse[]> {
    const bookings = await this.bookingRepository.find({
      ...options,
      relations: {
        tenancy: true,
        subCarPark: true,
      },
    });

    return bookings.map(booking => ({
      id: booking.id,
      email: booking.email,
      vehicleReg: booking.vehicleReg,
      subCarParkCode: booking.subCarParkCode,
      property: booking.property,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      tenancyName: booking.tenancy?.tenantName,
      subCarParkName: booking.subCarPark?.carParkName,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));
  }

  async findOne(options?: FindOneOptions<Booking>): Promise<BookingResponse | null> {
    const booking = await this.bookingRepository.findOne({
      ...options,
      relations: {
        tenancy: true,
        subCarPark: true,
      },
    });

    if (!booking) {
      return null;
    }

    return {
      id: booking.id,
      email: booking.email,
      vehicleReg: booking.vehicleReg,
      tenancyId: booking.tenancyId,
      tenancy: booking.tenancy ? {
        id: booking.tenancy.id,
        tenantName: booking.tenancy.tenantName,
        tenantEmail: booking.tenancy.tenantEmail,
      } : undefined,
      subCarParkCode: booking.subCarParkCode,
      subCarParkId: booking.subCarParkId,
      subCarPark: booking.subCarPark ? {
        id: booking.subCarPark.id,
        carParkName: booking.subCarPark.carParkName,
        subCarParkCode: booking.subCarPark.subCarParkCode,
        location: booking.subCarPark.location,
        carSpace: booking.subCarPark.carSpace,
      } : undefined,
      property: booking.property,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  async update(id: string, updateDto: UpdateBookingRequest): Promise<BookingUpdateResponse> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: {
        tenancy: true,
        subCarPark: true,
      },
    });

    if (!booking) {
      throw new CustomException(
        ErrorCode.BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate status transitions
    if (updateDto.status) {
      if (booking.status === BookingStatus.EXPIRED && updateDto.status !== BookingStatus.EXPIRED) {
        throw new CustomException(
          ErrorCode.BOOKING_EXPIRED.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (booking.status === BookingStatus.CHECKOUT && updateDto.status !== BookingStatus.CHECKOUT) {
        throw new CustomException(
          ErrorCode.BOOKING_ALREADY_COMPLETED.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate dates if being updated
    if (updateDto.startTime || updateDto.endTime) {
      const startTime = updateDto.startTime ? new Date(updateDto.startTime) : new Date(booking.startTime);
      const endTime = updateDto.endTime ? new Date(updateDto.endTime) : new Date(booking.endTime);

      if (startTime >= endTime) {
        throw new CustomException(
          ErrorCode.INVALID_BOOKING_DATES.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate vehicle registration if being updated
    if (updateDto.vehicleReg && !this.isValidVehicleRegistration(updateDto.vehicleReg)) {
      throw new CustomException(
        ErrorCode.INVALID_VEHICLE_REGISTRATION.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    Object.assign(booking, updateDto);
    const updatedBooking = await this.bookingRepository.save(booking);

    return {
      id: updatedBooking.id,
      email: updatedBooking.email,
      vehicleReg: updatedBooking.vehicleReg,
      subCarParkCode: updatedBooking.subCarParkCode,
      property: updatedBooking.property,
      startTime: updatedBooking.startTime,
      endTime: updatedBooking.endTime,
      status: updatedBooking.status,
      updatedAt: updatedBooking.updatedAt,
      message: 'Booking updated successfully',
    };
  }

  async remove(id: string): Promise<BookingDeleteResponse> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new CustomException(
        ErrorCode.BOOKING_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (booking.status === BookingStatus.CHECKOUT) {
      throw new CustomException(
        ErrorCode.BOOKING_ALREADY_COMPLETED.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const email = booking.email;
    const vehicleReg = booking.vehicleReg;
    await this.bookingRepository.remove(booking);

    return {
      id,
      email,
      vehicleReg,
      message: 'Booking deleted successfully',
      deletedAt: new Date(),
    };
  }

  private isValidVehicleRegistration(vehicleReg: string): boolean {
    // Basic validation - can be enhanced based on requirements
    const regex = /^[A-Z0-9]{1,10}$/i;
    return regex.test(vehicleReg) && vehicleReg.length >= 3;
  }
}

