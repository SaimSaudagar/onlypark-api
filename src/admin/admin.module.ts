import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { MasterCarParkModule } from './master-car-park/master-car-park.module';
import { SubCarParkModule } from './sub-car-park/sub-car-park.module';
import { VisitorBookingModule } from './visitor-booking/visitor-booking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    MasterCarParkModule,
    SubCarParkModule,
    VisitorBookingModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
