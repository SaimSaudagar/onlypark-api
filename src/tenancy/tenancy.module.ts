import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenancyController } from './tenancy.controller';
import { TenancyService } from './tenancy.service';
import { Tenancy } from './entities/tenancy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenancy])],
  controllers: [TenancyController],
  providers: [TenancyService],
  exports: [TenancyService],
})
export class TenancyModule {}
