import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {
  VisitorBookingStatus,
  CustomException,
  ErrorCode,
  TemplateKeys,
} from "../common";
import { VisitorBooking } from "./entities/visitor.entity";
import { SubCarPark } from "../sub-car-park/entities/sub-car-park.entity";
import { Tenancy } from "../tenancy/entities/tenancy.entity";
import { EmailNotificationService } from "../common/services/email/email-notification.service";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import {
  CreateVisitorBookingRequest,
  CreateVisitorBookingResponse,
  GetBookingByTokenResponse,
} from "./visitor.dto";

@Injectable()
export class VisitorBookingService {
  constructor(
    @InjectRepository(VisitorBooking)
    private visitorBookingRepository: Repository<VisitorBooking>,
    @InjectRepository(SubCarPark)
    private subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(Tenancy)
    private tenancyRepository: Repository<Tenancy>,
    private emailNotificationService: EmailNotificationService,
    private configService: ConfigService,
    private dataSource: DataSource
  ) {}

  async create(
    createVisitorBookingDto: CreateVisitorBookingRequest
  ): Promise<CreateVisitorBookingResponse> {
    const { email, registrationNumber, subCarParkId, tenancyId } =
      createVisitorBookingDto;

    // Validate sub car park exists
    const subCarPark = await this.subCarParkRepository.findOne({
      where: { id: subCarParkId },
    });
    console.log(subCarPark);

    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate tenancy exists if provided
    let tenancy = null;
    if (tenancyId) {
      tenancy = await this.tenancyRepository.findOne({
        where: { id: tenancyId, subCarParkId: subCarParkId },
      });

      if (!tenancy) {
        throw new CustomException(
          ErrorCode.TENANCY_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const totalBookings = await this.visitorBookingRepository.count({
      where: {
        status: VisitorBookingStatus.ACTIVE,
        subCarParkId,
      },
    });

    if (totalBookings >= subCarPark.carSpace) {
      throw new CustomException(
        ErrorCode.BOOKING_CAPACITY_EXCEEDED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const companyEmails = await this.subCarParkRepository.findOne({
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

    const domainNames = companyEmails.whitelistCompanies.map(
      (company) => company.domainName
    );

    if (domainNames.includes(email)) {
      throw new CustomException(
        ErrorCode.DOMAIN_NAME_NOT_ALLOWED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check for existing active booking with same vehicle registration and overlapping time
    const existingBookings = await this.visitorBookingRepository.count({
      where: {
        registrationNumber,
        status: VisitorBookingStatus.ACTIVE,
        subCarParkId,
      },
    });

    console.log(existingBookings);
    console.log(subCarPark.noOfPermitsPerRegNo);

    if (existingBookings >= subCarPark.noOfPermitsPerRegNo) {
      throw new CustomException(
        ErrorCode.PERMITS_PER_REGISTRATION_EXCEEDED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const endTime = new Date(
      new Date().getTime() + subCarPark.freeHours * 60 * 60 * 1000
    );
    const token = crypto.randomBytes(32).toString("hex");

    // Determine initial booking status based on tenant email check requirement
    const initialStatus =
      subCarPark.tenantEmailCheck && tenancyId
        ? VisitorBookingStatus.UNAUTHENTICATED
        : VisitorBookingStatus.ACTIVE;

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create booking using query builder
      const insertResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(VisitorBooking)
        .values({
          email,
          registrationNumber,
          subCarParkId,
          tenancyId,
          startDate: new Date().toISOString(),
          endDate: endTime.toISOString(),
          status: initialStatus,
          token,
        })
        .returning([
          "id",
          "email",
          "registrationNumber",
          "subCarParkId",
          "tenancyId",
          "startDate",
          "endDate",
          "status",
          "token",
        ])
        .execute();

      const savedBooking = insertResult.raw[0];

      // Send appropriate email based on status
      if (initialStatus === VisitorBookingStatus.UNAUTHENTICATED && tenancy) {
        // Send tenant verification email
        await this.sendTenantVerificationEmail(
          savedBooking,
          subCarPark,
          tenancy
        );
      } else {
        // Send regular booking confirmation email
        await this.sendBookingConfirmationEmail(savedBooking, subCarPark);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        id: savedBooking.id,
        email: savedBooking.email,
        registrationNumber: savedBooking.registrationNumber,
        subCarParkId: savedBooking.subCarParkId,
        tenancyId: savedBooking.tenancyId,
        startTime: savedBooking.startDate,
        endTime: savedBooking.endDate,
        status: savedBooking.status,
        token: savedBooking.token,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new CustomException(
        ErrorCode.EMAIL_SEND_FAILED.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { email, error: error.message }
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async getBookingByToken(token: string): Promise<GetBookingByTokenResponse> {
    const booking = await this.visitorBookingRepository.findOne({
      where: { token },
      relations: {
        subCarPark: true,
        tenancy: true,
      },
    });

    if (!booking) {
      throw new CustomException(
        ErrorCode.VISITOR_BOOKING_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    return {
      id: booking.id,
      email: booking.email,
      registrationNumber: booking.registrationNumber,
      subCarParkId: booking.subCarParkId,
      tenancyId: booking.tenancyId,
      startTime: booking.startDate.toISOString(),
      endTime: booking.endDate.toISOString(),
      status: booking.status,
      subCarPark: {
        id: booking.subCarPark.id,
        name: booking.subCarPark.carParkName,
        freeHours: booking.subCarPark.freeHours,
      },
      tenancy: {
        id: booking.tenancy.id,
        name: booking.tenancy.tenantName,
      },
    };
  }

  async verifyTenantEmail(
    token: string
  ): Promise<CreateVisitorBookingResponse> {
    const booking = await this.visitorBookingRepository.findOne({
      where: { token },
      relations: {
        subCarPark: true,
        tenancy: true,
      },
    });

    if (!booking) {
      throw new CustomException(
        ErrorCode.VISITOR_BOOKING_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }

    if (booking.status !== VisitorBookingStatus.UNAUTHENTICATED) {
      throw new CustomException(
        ErrorCode.CLIENT_ERROR.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if booking has expired
    if (new Date() > booking.endDate) {
      throw new CustomException(
        ErrorCode.BOOKING_EXPIRED.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update booking status to ACTIVE
      await queryRunner.manager
        .createQueryBuilder()
        .update(VisitorBooking)
        .set({ status: VisitorBookingStatus.ACTIVE })
        .where({ id: booking.id })
        .execute();

      // Send booking confirmation email to visitor
      await this.sendBookingConfirmationEmail(booking, booking.subCarPark);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        id: booking.id,
        email: booking.email,
        registrationNumber: booking.registrationNumber,
        subCarParkId: booking.subCarParkId,
        tenancyId: booking.tenancyId,
        startTime: booking.startDate.toISOString(),
        endTime: booking.endDate.toISOString(),
        status: VisitorBookingStatus.ACTIVE,
        token: booking.token,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new CustomException(
        ErrorCode.EMAIL_SEND_FAILED.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { error: error.message }
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async sendTenantVerificationEmail(
    booking: VisitorBooking,
    subCarPark: SubCarPark,
    tenancy: Tenancy
  ): Promise<void> {
    const verificationUrl = `${this.configService.get("APP_URL")}/visitor-bookings/verify-tenant/${booking.token}`;

    await this.emailNotificationService.sendUsingTemplate({
      to: [tenancy.tenantEmail],
      templateKey: TemplateKeys.TENANT_EMAIL_VERIFICATION,
      data: {
        tenantName: tenancy.tenantName,
        email: booking.email,
        registrationNumber: booking.registrationNumber,
        carParkName: subCarPark.carParkName,
        carParkCode: subCarPark.subCarParkCode,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: booking.status,
        verificationUrl: verificationUrl,
      },
    });
  }

  private async sendBookingConfirmationEmail(
    booking: VisitorBooking,
    subCarPark: SubCarPark
  ): Promise<void> {
    const bookingUrl = `${this.configService.get("APP_URL")}/visitor-booking/${booking.token}`;

    // Get tenancy name if exists
    let tenancyName = "";
    if (booking.tenancyId) {
      const tenancy = await this.tenancyRepository.findOne({
        where: { id: booking.tenancyId },
      });
      tenancyName = tenancy?.tenantName || "";
    }

    await this.emailNotificationService.sendUsingTemplate({
      to: [booking.email],
      templateKey: TemplateKeys.VISITOR_BOOKING_CONFIRMATION,
      data: {
        registrationNumber: booking.registrationNumber,
        carParkName: subCarPark.carParkName,
        carParkCode: subCarPark.subCarParkCode,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: VisitorBookingStatus.ACTIVE,
        tenancyName: tenancyName || "",
        bookingUrl: bookingUrl,
      },
    });
  }
}
