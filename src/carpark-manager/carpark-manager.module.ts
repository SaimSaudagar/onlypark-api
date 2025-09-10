import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarparkManagerController } from './carpark-manager.controller';
import { CarparkManagerService } from './carpark-manager.service';
import { CarparkManager } from './entities/carpark-manager.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarparkManager])],
  controllers: [CarparkManagerController],
  providers: [CarparkManagerService],
  exports: [CarparkManagerService],
})
export class CarparkManagerModule { }
