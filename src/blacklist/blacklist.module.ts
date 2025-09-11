import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';
import { BlacklistReg } from './entities/blacklist-reg.entity';
import { MasterCarParkModule } from '../master-car-park/master-car-park.module';

@Module({
  imports: [TypeOrmModule.forFeature([BlacklistReg]), MasterCarParkModule],
  controllers: [BlacklistController],
  providers: [BlacklistService],
  exports: [BlacklistService],
})
export class BlacklistModule { }
