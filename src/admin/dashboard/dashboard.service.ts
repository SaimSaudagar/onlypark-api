import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan, MoreThan } from "typeorm";
import { DataSource } from "typeorm";
import {
  DashboardRequest,
  DashboardResponse,
  DashboardMetricsResponse,
  TotalVisitorsResponse,
  ScanStayResponse,
  DigitalPermitsResponse,
  NonComplianceResponse,
  DisputesResponse,
} from "./dashboard.dto";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { Infringement } from "../../infringement/entities/infringement.entity";
import { Dispute } from "../../dispute/entities/dispute.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import {
  VisitorBookingStatus,
  WhitelistStatus,
  InfringementStatus,
  DisputeStatus,
  WhitelistType,
} from "../../common/enums";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(VisitorBooking)
    private visitorBookingRepository: Repository<VisitorBooking>,
    @InjectRepository(Whitelist)
    private whitelistRepository: Repository<Whitelist>,
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(SubCarPark)
    private subCarParkRepository: Repository<SubCarPark>,
    private dataSource: DataSource
  ) {}

  async getDashboardData(
    request: DashboardRequest
  ): Promise<DashboardResponse> {
    const { subCarParkId, dateFrom, dateTo } = request;

    // Set default date range if not provided
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom
      ? new Date(dateFrom)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const [
      metrics,
      totalVisitors,
      scanStay,
      digitalPermits,
      nonCompliance,
      disputes,
    ] = await Promise.all([
      this.getMetrics(subCarParkId),
      this.getTotalVisitors(startDate, endDate, subCarParkId),
      this.getScanStayData(startDate, endDate, subCarParkId),
      this.getDigitalPermitsData(startDate, endDate, subCarParkId),
      this.getNonComplianceData(startDate, endDate, subCarParkId),
      this.getDisputesData(startDate, endDate, subCarParkId),
    ]);

    return {
      metrics,
      totalVisitors,
      scanStay,
      digitalPermits,
      nonCompliance,
      disputes,
    };
  }

  private async getMetrics(
    subCarParkId?: string
  ): Promise<DashboardMetricsResponse> {
    const whereCondition = subCarParkId ? { subCarParkId: subCarParkId } : {};

    // Get whitelist count
    const whitelist = await this.whitelistRepository.count({
      where: whereCondition,
    });

    // Get scan and stay count (visitor bookings)
    const scanAndStay = await this.visitorBookingRepository.count({
      where: whereCondition,
    });

    return {
      whitelist,
      scanAndStay,
    };
  }

  private async getTotalVisitors(
    startDate: Date,
    endDate: Date,
    subCarParkId?: string
  ): Promise<TotalVisitorsResponse[]> {
    const whereCondition = subCarParkId ? { subCarParkId: subCarParkId } : {};

    // Get all visitor bookings in the date range
    const bookings = await this.visitorBookingRepository.find({
      where: {
        ...whereCondition,
        createdAt: Between(startDate, endDate),
      },
      select: ["createdAt"],
    });

    // Group by date and count
    const groupedData = bookings.reduce(
      (acc, booking) => {
        const date = booking.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Convert to array and sort by date
    return Object.entries(groupedData)
      .map(([date, visitors]) => ({ date, visitors }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getScanStayData(
    startDate: Date,
    endDate: Date,
    subCarParkId?: string
  ): Promise<ScanStayResponse> {
    const whereCondition = subCarParkId ? { subCarParkId: subCarParkId } : {};

    // Get all visitor bookings in the date range
    const bookings = await this.visitorBookingRepository.find({
      where: {
        ...whereCondition,
        createdAt: Between(startDate, endDate),
      },
      select: ["status", "createdAt"],
    });

    // Group by month and count active and expired bookings
    const monthlyData = bookings.reduce(
      (acc, booking) => {
        const month = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM format
        if (!acc[month]) {
          acc[month] = { active: 0, expired: 0 };
        }

        if (booking.status === VisitorBookingStatus.ACTIVE) {
          acc[month].active++;
        } else if (booking.status === VisitorBookingStatus.CHECKOUT) {
          acc[month].expired++;
        }

        return acc;
      },
      {} as Record<string, { active: number; expired: number }>
    );

    // Convert to array and sort by month
    const monthlyDataArray = Object.entries(monthlyData)
      .map(([month, counts]) => ({
        month,
        active: counts.active,
        expired: counts.expired,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { monthlyData: monthlyDataArray };
  }

  private async getDigitalPermitsData(
    startDate: Date,
    endDate: Date,
    subCarParkId?: string
  ): Promise<DigitalPermitsResponse> {
    const whereCondition = subCarParkId ? { subCarParkId: subCarParkId } : {};

    // Get different types of whitelist entries
    const [selfServer, permanent, shortStay, scheduled] = await Promise.all([
      this.whitelistRepository.count({
        where: {
          ...whereCondition,
          whitelistType: WhitelistType.SELF_SERVE,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.whitelistRepository.count({
        where: {
          ...whereCondition,
          whitelistType: WhitelistType.PERMANENT,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.whitelistRepository.count({
        where: {
          ...whereCondition,
          whitelistType: WhitelistType.HOUR,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.whitelistRepository.count({
        where: {
          ...whereCondition,
          whitelistType: WhitelistType.DATE,
          createdAt: Between(startDate, endDate),
        },
      }),
    ]);

    const total = selfServer + permanent + shortStay + scheduled;

    return {
      selfServer,
      permanent,
      shortStay,
      scheduled,
      total,
    };
  }

  private async getNonComplianceData(
    startDate: Date,
    endDate: Date,
    subCarParkId?: string
  ): Promise<NonComplianceResponse> {
    // Get infringement data
    const [notices, paid, unpaid] = await Promise.all([
      this.infringementRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
        },
      }),
      this.infringementRepository.count({
        where: {
          status: InfringementStatus.PAID,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.infringementRepository.count({
        where: {
          status: InfringementStatus.NOT_PAID,
          createdAt: Between(startDate, endDate),
        },
      }),
    ]);

    const total = notices;

    return {
      notices,
      paid,
      unpaid,
      total,
    };
  }

  private async getDisputesData(
    startDate: Date,
    endDate: Date,
    subCarParkId?: string
  ): Promise<DisputesResponse> {
    // Get dispute data
    const [total, pending, granted, denied] = await Promise.all([
      this.disputeRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
        },
      }),
      this.disputeRepository.count({
        where: {
          status: DisputeStatus.PENDING,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.disputeRepository.count({
        where: {
          status: DisputeStatus.APPROVED,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.disputeRepository.count({
        where: {
          status: DisputeStatus.REJECTED,
          createdAt: Between(startDate, endDate),
        },
      }),
    ]);

    return {
      total,
      pending,
      granted,
      denied,
    };
  }
}
