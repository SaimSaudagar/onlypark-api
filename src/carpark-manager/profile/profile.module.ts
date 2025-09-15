import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { CarparkManager } from '../entities/carpark-manager.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CarparkManager]),
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
    exports: [ProfileService],
})
export class ProfileModule { }
