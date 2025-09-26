import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCarPark } from './entities/sub-car-park.entity';
import { SubCarParkService } from './sub-car-park.service';
import { SubCarParkController } from './sub-car-park.controller';

@Module({
    imports: [TypeOrmModule.forFeature([SubCarPark])],
    controllers: [SubCarParkController],
    providers: [SubCarParkService],
    exports: [SubCarParkService],
})
export class SubCarParkModule { }