import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarMake } from '../../car-make/entities/car-make.entity';
import { CarMakeSeederService } from './car-make-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarMake])],
  providers: [CarMakeSeederService],
  exports: [CarMakeSeederService],
})
export class CarMakeSeederModule {}
