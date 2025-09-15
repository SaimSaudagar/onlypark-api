import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCarParkController } from './master-car-park.controller';
import { MasterCarParkService } from './master-car-park.service';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { CarparkManager } from '../entities/carpark-manager.entity';
import { CarparkManagerService } from '../carpark-manager.service';
import { CarparkManagerVisitorSubCarPark } from '../entities/carpark-manager-visitor-sub-car-park.entity';
import { CarparkManagerWhitelistSubCarPark } from '../entities/carpark-manager-whitelist-sub-car-park.entity';
import { CarparkManagerBlacklistSubCarPark } from '../entities/carpark-manager-blacklist-sub-car-park.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MasterCarPark,
            CarparkManager,
            CarparkManagerVisitorSubCarPark,
            CarparkManagerWhitelistSubCarPark,
            CarparkManagerBlacklistSubCarPark
        ]),
    ],
    controllers: [MasterCarParkController],
    providers: [MasterCarParkService, CarparkManagerService],
    exports: [MasterCarParkService],
})
export class MasterCarParkModule { }
