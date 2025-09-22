import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../user/entities/user-role.entity';
import { CarparkManager } from '../../carpark-manager/entities/carpark-manager.entity';
import { PatrolOfficer } from '../../patrol-officer/entities/patrol-officer.entity';
import { EmailNotificationModule } from '../../common/services/email/email-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, CarparkManager, PatrolOfficer]),
    EmailNotificationModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
