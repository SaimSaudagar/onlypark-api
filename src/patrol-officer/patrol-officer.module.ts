import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatrolOfficerController } from './patrol-officer.controller';
import { PatrolOfficerService } from './patrol-officer.service';
import { PatrolOfficer } from './entities/patrol-officer.entity';
import { MasterCarParkModule } from './master-car-park/master-car-park.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatrolOfficer]),
    MasterCarParkModule,
  ],
  controllers: [PatrolOfficerController],
  providers: [PatrolOfficerService],
  exports: [PatrolOfficerService],
})
export class PatrolOfficerModule { }
