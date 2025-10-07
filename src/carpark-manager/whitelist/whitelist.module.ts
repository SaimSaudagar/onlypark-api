import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhitelistController } from './whitelist.controller';
import { WhitelistService } from './whitelist.service';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';
import { CarparkManager } from '../entities/carpark-manager.entity';
import { CarparkManagerVisitorSubCarPark } from '../entities/carpark-manager-visitor-sub-car-park.entity';
import { CarparkManagerWhitelistSubCarPark } from '../entities/carpark-manager-whitelist-sub-car-park.entity';
import { CarparkManagerBlacklistSubCarPark } from '../entities/carpark-manager-blacklist-sub-car-park.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Whitelist,
            CarparkManager,
            CarparkManagerVisitorSubCarPark,
            CarparkManagerWhitelistSubCarPark,
            CarparkManagerBlacklistSubCarPark,
        ]),
    ],
    controllers: [WhitelistController],
    providers: [WhitelistService],
    exports: [WhitelistService],
})
export class WhitelistModule { }
