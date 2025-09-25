import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfringementController } from './infringement.controller';
import { InfringementService } from './infringement.service';
import { Infringement } from '../../infringement/entities/infringement.entity';
import { InfringementReason } from '../../infringement/entities/infringement-reason.entity';
import { InfringementPenalty } from '../../infringement/entities/infringement-penalty.entity';
import { InfringementCarPark } from '../../infringement/entities/infringement-car-park.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Infringement, InfringementReason, InfringementPenalty, InfringementCarPark])],
  controllers: [InfringementController],
  providers: [InfringementService],
  exports: [InfringementService],
})
export class InfringementModule { }
