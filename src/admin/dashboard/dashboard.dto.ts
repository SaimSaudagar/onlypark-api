import { IsOptional, IsString, IsDateString, IsEnum } from "class-validator";

export class DashboardRequest {
  @IsOptional()
  @IsString()
  subCarParkId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class DashboardMetricsResponse {
  availableSpaces: number;
  expiredSpaces: number;
}

export class TotalVisitorsResponse {
  date: string;
  visitors: number;
}

export class ScanStayMonthlyData {
  month: string;
  active: number;
  expired: number;
}

export class ScanStayResponse {
  monthlyData: ScanStayMonthlyData[];
}

export class DigitalPermitsResponse {
  selfServer: number;
  permanent: number;
  shortStay: number;
  scheduled: number;
  total: number;
}

export class NonComplianceResponse {
  notices: number;
  paid: number;
  unpaid: number;
  total: number;
}

export class DisputesResponse {
  total: number;
  pending: number;
  granted: number;
  denied: number;
}

export class DashboardResponse {
  metrics: DashboardMetricsResponse;
  totalVisitors: TotalVisitorsResponse[];
  scanStay: ScanStayResponse;
  digitalPermits: DigitalPermitsResponse;
  nonCompliance: NonComplianceResponse;
  disputes: DisputesResponse;
}
