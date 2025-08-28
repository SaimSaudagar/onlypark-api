import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCarParkController } from './master-car-park.controller';
import { MasterCarParkService } from './master-car-park.service';
import { MasterCarPark } from './entities/master-car-park.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCarPark])],
  controllers: [MasterCarParkController],
  providers: [MasterCarParkService],
  exports: [MasterCarParkService],
})
export class MasterCarParkModule {}
