import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GeolocationService {
  constructor(private readonly configService: ConfigService) {}

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    // TODO: Implement Haversine formula
    console.log(
      `Calculating distance between (${lat1}, ${lng1}) and (${lat2}, ${lng2})`,
    );
    return 1000; // placeholder distance in meters
  }

  isWithinRadius(
    userLat: number,
    userLng: number,
    targetLat: number,
    targetLng: number,
    radius: number,
  ): boolean {
    const distance = this.calculateDistance(
      userLat,
      userLng,
      targetLat,
      targetLng,
    );
    return distance <= radius;
  }
}
