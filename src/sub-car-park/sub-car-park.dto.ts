export class GetSubCarParkByCodeResponse {
    id: string;
    carParkName: string;
    tenancies: TenancyResponse[];
}

export class TenancyResponse {
    id: string;
    tenantName: string;
}