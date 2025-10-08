import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VisitorBookingService } from "./visitor-booking.service";
import { VisitorBookingController } from "./visitor-booking.controller";
import { VisitorBooking } from "./entities/visitor-booking.entity";
import { Tenancy } from "../tenancy/entities/tenancy.entity";
import { SubCarPark } from "../sub-car-park/entities/sub-car-park.entity";
import { EmailNotificationModule } from "../common/services/email/email-notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([VisitorBooking, SubCarPark, Tenancy]),
    EmailNotificationModule,
  ],
  controllers: [VisitorBookingController],
  providers: [VisitorBookingService],
  exports: [VisitorBookingService],
})
export class VisitorBookingModule {}
