import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCarParkController } from './sub-car-park.controller';
import { SubCarParkService } from './sub-car-park.service';
import { SubCarPark } from './entities/sub-car-park.entity';
import { MasterCarPark } from '../master-car-park/entities/master-car-park.entity';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubCarPark, MasterCarPark]), TenancyModule],
  controllers: [SubCarParkController],
  providers: [SubCarParkService],
  exports: [SubCarParkService],
})
export class SubCarParkModule { }
