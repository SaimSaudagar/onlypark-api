import { IsOptional, IsString, IsDateString } from "class-validator";
import { ApiGetBaseRequest } from "../../common";

export class CarparkManagerDashboardRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class CarparkManagerDashboardMetricsResponse {
  availableSpaces: number;
  expiredSpaces: number;
}

export class CarparkManagerTotalVisitorsResponse {
  date: string;
  visitors: number;
}

export class CarparkManagerScanStayResponse {
  month: string;
  active: number;
  expired: number;
}

export class CarparkManagerDigitalPermitsResponse {
  selfServer: number;
  permanent: number;
  shortStay: number;
  scheduled: number;
  total: number;
}

export class CarparkManagerNonComplianceResponse {
  notices: number;
  paid: number;
  unpaid: number;
  total: number;
}

export class CarparkManagerDisputesResponse {
  total: number;
  pending: number;
  granted: number;
  denied: number;
}

export class CarparkManagerDashboardResponse {
  metrics: CarparkManagerDashboardMetricsResponse;
  totalVisitors: CarparkManagerTotalVisitorsResponse[];
  scanStay: CarparkManagerScanStayResponse[];
  digitalPermits: CarparkManagerDigitalPermitsResponse;
  nonCompliance: CarparkManagerNonComplianceResponse;
  disputes: CarparkManagerDisputesResponse;
}
