import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, In } from "typeorm";
import { DataSource } from "typeorm";
import { CustomException } from "../../common/exceptions/custom.exception";
import {
  CarparkManagerDashboardRequest,
  CarparkManagerDashboardResponse,
  CarparkManagerDashboardMetricsResponse,
  CarparkManagerTotalVisitorsResponse,
  CarparkManagerScanStayResponse,
  CarparkManagerDigitalPermitsResponse,
  CarparkManagerNonComplianceResponse,
  CarparkManagerDisputesResponse,
} from "./dashboard.dto";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { Whitelist } from "../../whitelist/entities/whitelist.entity";
import { Infringement } from "../../infringement/entities/infringement.entity";
import { Dispute } from "../../dispute/entities/dispute.entity";
import { CarparkManagerVisitorSubCarPark } from "../entities/carpark-manager-visitor-sub-car-park.entity";
import {
  VisitorBookingStatus,
  WhitelistStatus,
  InfringementStatus,
  DisputeStatus,
  WhitelistType,
} from "../../common/enums";
import { ErrorCode } from "src/common/exceptions/error-code";

@Injectable()
export class CarparkManagerDashboardService {
  constructor(
    @InjectRepository(VisitorBooking)
    private visitorBookingRepository: Repository<VisitorBooking>,
    @InjectRepository(Whitelist)
    private whitelistRepository: Repository<Whitelist>,
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(CarparkManagerVisitorSubCarPark)
    private carparkManagerVisitorSubCarParkRepository: Repository<CarparkManagerVisitorSubCarPark>,
    private dataSource: DataSource
  ) {}

  async getDashboardData(
    request: CarparkManagerDashboardRequest,
    carparkManagerId: string
  ): Promise<CarparkManagerDashboardResponse> {
    const { subCarParkId, dateFrom, dateTo } = request;

    // Set default date range if not provided
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom
      ? new Date(dateFrom)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Get assigned sub car park IDs for this carpark manager
    const assignedSubCarParkIds =
      await this.getAssignedSubCarParkIds(carparkManagerId);

    // If specific subCarParkId is requested, validate it's assigned to this manager
    let filteredSubCarParkIds = assignedSubCarParkIds;
    if (subCarParkId) {
      if (!assignedSubCarParkIds.includes(subCarParkId)) {
        throw new CustomException(
          ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
          HttpStatus.BAD_REQUEST
        );
      }
      filteredSubCarParkIds = [subCarParkId];
    }

    const [
      metrics,
      totalVisitors,
      scanStay,
      digitalPermits,
      nonCompliance,
      disputes,
    ] = await Promise.all([
      this.getMetrics(filteredSubCarParkIds),
      this.getTotalVisitors(startDate, endDate, filteredSubCarParkIds),
      this.getScanStayData(startDate, endDate, filteredSubCarParkIds),
      this.getDigitalPermitsData(startDate, endDate, filteredSubCarParkIds),
      this.getNonComplianceData(startDate, endDate), // Noncompliance shows all car parks
      this.getDisputesData(startDate, endDate, filteredSubCarParkIds),
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

  private async getAssignedSubCarParkIds(
    carparkManagerId: string
  ): Promise<string[]> {
    const assignments =
      await this.carparkManagerVisitorSubCarParkRepository.find({
        where: { carparkManagerId },
        select: ["subCarParkId"],
      });

    return assignments.map((assignment) => assignment.subCarParkId);
  }

  private async getMetrics(
    assignedSubCarParkIds: string[]
  ): Promise<CarparkManagerDashboardMetricsResponse> {
    if (assignedSubCarParkIds.length === 0) {
      return { availableSpaces: 0, expiredSpaces: 0 };
    }

    // Get available spaces (active visitor bookings)
    const availableSpaces = await this.visitorBookingRepository.count({
      where: {
        subCarParkId: In(assignedSubCarParkIds),
        status: VisitorBookingStatus.ACTIVE,
      },
    });

    // Get expired spaces (checkout visitor bookings)
    const expiredSpaces = await this.visitorBookingRepository.count({
      where: {
        subCarParkId: In(assignedSubCarParkIds),
        status: VisitorBookingStatus.CHECKOUT,
      },
    });

    return {
      availableSpaces,
      expiredSpaces,
    };
  }

  private async getTotalVisitors(
    startDate: Date,
    endDate: Date,
    assignedSubCarParkIds: string[]
  ): Promise<CarparkManagerTotalVisitorsResponse[]> {
    if (assignedSubCarParkIds.length === 0) {
      return [];
    }

    // Get all visitor bookings in the date range for assigned car parks
    const bookings = await this.visitorBookingRepository.find({
      where: {
        subCarParkId: In(assignedSubCarParkIds),
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
    assignedSubCarParkIds: string[]
  ): Promise<CarparkManagerScanStayResponse[]> {
    if (assignedSubCarParkIds.length === 0) {
      return [];
    }

    // Get all visitor bookings in the date range for assigned car parks
    const bookings = await this.visitorBookingRepository.find({
      where: {
        subCarParkId: In(assignedSubCarParkIds),
        createdAt: Between(startDate, endDate),
      },
      select: ["createdAt", "status"],
    });

    // Group by month and status
    const groupedData = bookings.reduce(
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
    return Object.entries(groupedData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private async getDigitalPermitsData(
    startDate: Date,
    endDate: Date,
    assignedSubCarParkIds: string[]
  ): Promise<CarparkManagerDigitalPermitsResponse> {
    if (assignedSubCarParkIds.length === 0) {
      return {
        selfServer: 0,
        permanent: 0,
        shortStay: 0,
        scheduled: 0,
        total: 0,
      };
    }

    // Get different types of whitelist entries for assigned car parks
    const [selfServer, permanent, shortStay, scheduled] = await Promise.all([
      this.whitelistRepository.count({
        where: {
          subCarParkId: In(assignedSubCarParkIds),
          whitelistType: WhitelistType.SELF_SERVE,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.whitelistRepository.count({
        where: {
          subCarParkId: In(assignedSubCarParkIds),
          whitelistType: WhitelistType.PERMANENT,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.whitelistRepository.count({
        where: {
          subCarParkId: In(assignedSubCarParkIds),
          whitelistType: WhitelistType.HOUR,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.whitelistRepository.count({
        where: {
          subCarParkId: In(assignedSubCarParkIds),
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
    endDate: Date
  ): Promise<CarparkManagerNonComplianceResponse> {
    // Get infringement data for all car parks (not filtered by assigned car parks)
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
    assignedSubCarParkIds: string[]
  ): Promise<CarparkManagerDisputesResponse> {
    if (assignedSubCarParkIds.length === 0) {
      return { total: 0, pending: 0, granted: 0, denied: 0 };
    }

    // Get dispute data for assigned car parks
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
