import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { VehicleRegChangeOtp } from './entities/vehicle-reg-change-otp.entity';
import { SubCarPark } from '../sub-car-park/entities/sub-car-park.entity';
import { Tenancy } from '../tenancy/entities/tenancy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, VehicleRegChangeOtp, SubCarPark, Tenancy])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule { }

