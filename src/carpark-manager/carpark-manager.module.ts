import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarparkManagerController } from './carpark-manager.controller';
import { CarparkManagerService } from './carpark-manager.service';
import { CarparkManager } from './entities/carpark-manager.entity';
import { MasterCarParkModule } from './master-car-park/master-car-park.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarparkManager]),
    MasterCarParkModule,
  ],
  controllers: [CarparkManagerController],
  providers: [CarparkManagerService],
  exports: [CarparkManagerService],
})
export class CarparkManagerModule { }
