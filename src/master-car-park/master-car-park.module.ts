import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCarParkController } from './master-car-park.controller';
import { MasterCarParkService } from './master-car-park.service';
import { MasterCarPark } from './entities/master-car-park.entity';
import { UserModule } from '../user/user.module';
import { CarparkManagerModule } from '../carpark-manager/carpark-manager.module';
import { PatrolOfficerModule } from '../patrol-officer/patrol-officer.module';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCarPark]), UserModule, CarparkManagerModule, PatrolOfficerModule],
  controllers: [MasterCarParkController],
  providers: [MasterCarParkService],
  exports: [MasterCarParkService],
})
export class MasterCarParkModule { }
