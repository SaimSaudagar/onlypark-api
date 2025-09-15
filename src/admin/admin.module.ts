import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { MasterCarParkModule } from './master-car-park/master-car-park.module';
import { SubCarParkModule } from './sub-car-park/sub-car-park.module';
import { VisitorBookingModule } from './visitor-booking/visitor-booking.module';
import { BlacklistModule } from './blacklist/blacklist.module';

@Module({
  imports: [
    MasterCarParkModule,
    SubCarParkModule,
    VisitorBookingModule,
    BlacklistModule,
  ],
})
export class AdminModule { }
