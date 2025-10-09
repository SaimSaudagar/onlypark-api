import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VisitorBookingService } from "./visitor.service";
import { VisitorBookingController } from "./visitor.controller";
import { VisitorBooking } from "./entities/visitor.entity";
import { Tenancy } from "../tenancy/entities/tenancy.entity";
import { SubCarPark } from "../sub-car-park/entities/sub-car-park.entity";
import { EmailNotificationModule } from "../common/services/email/email-notification.module";
import { Blacklist } from "../blacklist/entities/blacklist-reg.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([VisitorBooking, SubCarPark, Tenancy, Blacklist]),
    EmailNotificationModule,
  ],
  controllers: [VisitorBookingController],
  providers: [VisitorBookingService],
  exports: [VisitorBookingService],
})
export class VisitorBookingModule {}
