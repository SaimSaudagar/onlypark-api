import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import { UserRole } from '../../user/entities/user-role.entity';
import { PatrolOfficer } from '../../patrol-officer/entities/patrol-officer.entity';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { PatrolOfficerVisitorSubCarPark } from '../../patrol-officer/entities/patrol-officer-visitor-sub-car-park.entity';
import { PatrolOfficerWhitelistSubCarPark } from '../../patrol-officer/entities/patrol-officer-whitelist-sub-car-park.entity';
import { PatrolOfficerBlacklistSubCarPark } from '../../patrol-officer/entities/patrol-officer-blacklist-sub-car-park.entity';
import { CarparkManager } from '../../carpark-manager/entities/carpark-manager.entity';
import { CarparkManagerVisitorSubCarPark } from '../../carpark-manager/entities/carpark-manager-visitor-sub-car-park.entity';
import { CarparkManagerWhitelistSubCarPark } from '../../carpark-manager/entities/carpark-manager-whitelist-sub-car-park.entity';
import { CarparkManagerBlacklistSubCarPark } from '../../carpark-manager/entities/carpark-manager-blacklist-sub-car-park.entity';
import { UserSeederService } from './user-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Role,
    UserRole,
    PatrolOfficer,
    SubCarPark,
    PatrolOfficerVisitorSubCarPark,
    PatrolOfficerWhitelistSubCarPark,
    PatrolOfficerBlacklistSubCarPark,
    CarparkManager,
    CarparkManagerVisitorSubCarPark,
    CarparkManagerWhitelistSubCarPark,
    CarparkManagerBlacklistSubCarPark
  ])],
  providers: [UserSeederService],
  exports: [UserSeederService],
})
export class UserSeederModule { }
