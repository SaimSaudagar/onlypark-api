import { IsOptional, IsEnum } from 'class-validator';
import { ParkingSpotStatus } from '../../common/enums';
import { ApiGetBaseRequest } from '../../common/types';

export class FindSubCarParkRequest extends ApiGetBaseRequest {
    @IsOptional()
    search?: string;

    @IsOptional()
    @IsEnum(ParkingSpotStatus)
    status?: ParkingSpotStatus;
}

export class FindSubCarParkResponse {
    id: string;
    carParkName: string;
    carSpace: number;
    location: string;
    lat: number;
    lang: number;
    description?: string;
    subCarParkCode: string;
    freeHours?: number;
    tenantEmailCheck: boolean;
    geolocation: boolean;
    event: boolean;
    eventDate?: Date;
    eventExpiryDate?: Date;
    status: ParkingSpotStatus;
    masterCarParkId: string;
    masterCarPark?: {
        id: string;
        carParkName: string;
        masterCarParkCode: string;
        carParkType: string;
        status: string;
    };
}
