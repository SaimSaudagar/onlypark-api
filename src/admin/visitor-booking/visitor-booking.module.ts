import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorBookingController } from './visitor-booking.controller';
import { VisitorBookingService } from './visitor-booking.service';
import { VisitorBooking } from '../../visitor-booking/entities/visitor-booking.entity';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { SubCarParkModule } from '../sub-car-park/sub-car-park.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([VisitorBooking]),
        TenancyModule,
        SubCarParkModule
    ],
    controllers: [VisitorBookingController],
    providers: [VisitorBookingService],
    exports: [VisitorBookingService],
})
export class VisitorBookingModule { }
