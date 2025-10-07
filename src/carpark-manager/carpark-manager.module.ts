import { Module } from '@nestjs/common';
import { MasterCarParkModule } from './master-car-park/master-car-park.module';
import { SubCarParkModule } from './sub-car-park/sub-car-park.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { WhitelistModule } from './whitelist/whitelist.module';

@Module({
  imports: [
    MasterCarParkModule,
    SubCarParkModule,
    BlacklistModule,
    WhitelistModule,
  ],
})
export class CarparkManagerModule { }
