import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VisitorBookingController } from "./visitor.controller";
import { VisitorBookingService } from "./visitor.service";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { TenancyModule } from "../../tenancy/tenancy.module";
import { SubCarParkModule } from "../sub-car-park/sub-car-park.module";
import { BlacklistModule } from "../blacklist/blacklist.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([VisitorBooking]),
    TenancyModule,
    SubCarParkModule,
    BlacklistModule,
  ],
  controllers: [VisitorBookingController],
  providers: [VisitorBookingService],
  exports: [VisitorBookingService],
})
export class VisitorBookingModule {}
