import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';
import { Blacklist } from '../../blacklist/entities/blacklist-reg.entity';
import { PatrolOfficer } from '../entities/patrol-officer.entity';
import { PatrolOfficerVisitorSubCarPark } from '../entities/patrol-officer-visitor-sub-car-park.entity';
import { PatrolOfficerWhitelistSubCarPark } from '../entities/patrol-officer-whitelist-sub-car-park.entity';
import { PatrolOfficerBlacklistSubCarPark } from '../entities/patrol-officer-blacklist-sub-car-park.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Blacklist,
            PatrolOfficer,
            PatrolOfficerVisitorSubCarPark,
            PatrolOfficerWhitelistSubCarPark,
            PatrolOfficerBlacklistSubCarPark,
        ]),
    ],
    controllers: [BlacklistController],
    providers: [BlacklistService],
    exports: [BlacklistService],
})
export class BlacklistModule { }
