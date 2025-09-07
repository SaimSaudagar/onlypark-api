import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { AdminModule } from '../admin/admin.module';
import { CarparkManagerModule } from '../carpark-manager/carpark-manager.module';
import { PatrolOfficerModule } from '../patrol-officer/patrol-officer.module';
import { EmailModule } from '../common/services/email/email.module';
import { WhitelistModule } from '../whitelist/whitelist.module';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    AdminModule,
    CarparkManagerModule,
    PatrolOfficerModule,
    EmailModule,
    WhitelistModule,
    BlacklistModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
