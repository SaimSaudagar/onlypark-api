import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCarParkController } from './sub-car-park.controller';
import { SubCarParkService } from './sub-car-park.service';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { CarparkManager } from '../entities/carpark-manager.entity';
import { CarparkManagerVisitorSubCarPark } from '../entities/carpark-manager-visitor-sub-car-park.entity';
import { CarparkManagerWhitelistSubCarPark } from '../entities/carpark-manager-whitelist-sub-car-park.entity';
import { CarparkManagerBlacklistSubCarPark } from '../entities/carpark-manager-blacklist-sub-car-park.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SubCarPark,
            CarparkManager,
            CarparkManagerVisitorSubCarPark,
            CarparkManagerWhitelistSubCarPark,
            CarparkManagerBlacklistSubCarPark,
        ]),
    ],
    controllers: [SubCarParkController],
    providers: [SubCarParkService],
    exports: [SubCarParkService],
})
export class SubCarParkModule { }
