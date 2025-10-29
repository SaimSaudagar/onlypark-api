import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScanStaySeederService } from "./scan-stay-seeder.service";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Tenancy } from "../../tenancy/entities/tenancy.entity";

@Module({
  imports: [TypeOrmModule.forFeature([VisitorBooking, SubCarPark, Tenancy])],
  providers: [ScanStaySeederService],
  exports: [ScanStaySeederService],
})
export class ScanStaySeederModule {}
