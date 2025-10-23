import { IsOptional, IsString, IsDateString } from "class-validator";
import { ApiGetBaseRequest } from "../../common";

export class PatrolOfficerDashboardRequest extends ApiGetBaseRequest {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class PatrolOfficerDashboardMetricsResponse {
  availableSpaces: number;
  expiredSpaces: number;
}

export class PatrolOfficerTotalVisitorsResponse {
  date: string;
  visitors: number;
}

export class PatrolOfficerScanStayResponse {
  month: string;
  active: number;
  expired: number;
}

export class PatrolOfficerDigitalPermitsResponse {
  selfServer: number;
  permanent: number;
  shortStay: number;
  scheduled: number;
  total: number;
}

export class PatrolOfficerNonComplianceResponse {
  notices: number;
  paid: number;
  unpaid: number;
  total: number;
}

export class PatrolOfficerDisputesResponse {
  total: number;
  pending: number;
  granted: number;
  denied: number;
}

export class PatrolOfficerDashboardResponse {
  metrics: PatrolOfficerDashboardMetricsResponse;
  totalVisitors: PatrolOfficerTotalVisitorsResponse[];
  scanStay: PatrolOfficerScanStayResponse[];
  digitalPermits: PatrolOfficerDigitalPermitsResponse;
  nonCompliance: PatrolOfficerNonComplianceResponse;
  disputes: PatrolOfficerDisputesResponse;
}
