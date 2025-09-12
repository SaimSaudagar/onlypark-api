import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';
import { Dispute } from './entities/dispute.entity';
import { InfringementModule } from '../infringement/infringement.module';
import { CarMakeModule } from '../car-make/car-make.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dispute]),
        InfringementModule,
        CarMakeModule,
    ],
    controllers: [DisputeController],
    providers: [DisputeService],
    exports: [DisputeService],
})
export class DisputeModule { }
