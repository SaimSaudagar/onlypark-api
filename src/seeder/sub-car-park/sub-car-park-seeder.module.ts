import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { SubCarParkSeederService } from './sub-car-park-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubCarPark, MasterCarPark])],
  providers: [SubCarParkSeederService],
  exports: [SubCarParkSeederService],
})
export class SubCarParkSeederModule {}
