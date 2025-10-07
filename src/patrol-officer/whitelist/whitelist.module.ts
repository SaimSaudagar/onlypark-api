import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhitelistController } from './whitelist.controller';
import { WhitelistService } from './whitelist.service';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';
import { PatrolOfficer } from '../entities/patrol-officer.entity';
import { PatrolOfficerVisitorSubCarPark } from '../entities/patrol-officer-visitor-sub-car-park.entity';
import { PatrolOfficerWhitelistSubCarPark } from '../entities/patrol-officer-whitelist-sub-car-park.entity';
import { PatrolOfficerBlacklistSubCarPark } from '../entities/patrol-officer-blacklist-sub-car-park.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Whitelist,
            PatrolOfficer,
            PatrolOfficerVisitorSubCarPark,
            PatrolOfficerWhitelistSubCarPark,
            PatrolOfficerBlacklistSubCarPark,
        ]),
    ],
    controllers: [WhitelistController],
    providers: [WhitelistService],
    exports: [WhitelistService],
})
export class WhitelistModule { }
