import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCarParkController } from './master-car-park.controller';
import { MasterCarParkService } from './master-car-park.service';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { CarparkManager } from '../entities/carpark-manager.entity';
import { CarparkManagerService } from '../carpark-manager.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MasterCarPark, CarparkManager]),
    ],
    controllers: [MasterCarParkController],
    providers: [MasterCarParkService, CarparkManagerService],
    exports: [MasterCarParkService],
})
export class MasterCarParkModule { }
