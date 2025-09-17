import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { TenancySeederService } from './tenancy-seeder.service';

@Module({
    imports: [TypeOrmModule.forFeature([Tenancy, SubCarPark])],
    providers: [TenancySeederService],
    exports: [TenancySeederService],
})
export class TenancySeederModule { }
