import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { AdminModule } from '../admin/admin.module';
import { EmailModule } from '../common/services/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    AdminModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
