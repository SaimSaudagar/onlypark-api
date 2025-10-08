export class GetSubCarParkByCodeResponse {
  id: string;
  carParkName: string;
  tenantEmailCheck: boolean;
  tenancies: TenancyResponse[];
}

export class TenancyResponse {
  id: string;
  tenantName: string;
}
