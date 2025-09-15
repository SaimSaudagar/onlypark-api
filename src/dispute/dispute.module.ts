import { Module } from '@nestjs/common';
import { InfringementModule } from '../admin/infringement/infringement.module';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';
import { Dispute } from './entities/dispute.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
    imports: [TypeOrmModule.forFeature([Dispute]), InfringementModule],
    controllers: [DisputeController],
    providers: [DisputeService],
})
export class DisputeModule { }
