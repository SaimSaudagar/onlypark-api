import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { MasterCarParkModule } from './master-car-park/master-car-park.module';
import { SubCarParkModule } from './sub-car-park/sub-car-park.module';
import { VisitorBookingModule } from './visitor-booking/visitor-booking.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { InfringementModule } from './infringement/infringement.module';
import { DisputeModule } from './dispute/dispute.module';
import { WhitelistModule } from './whitelist/whitelist.module';

@Module({
  imports: [
    MasterCarParkModule,
    SubCarParkModule,
    VisitorBookingModule,
    BlacklistModule,
    InfringementModule,
    DisputeModule,
    WhitelistModule,
  ],
})
export class AdminModule { }
