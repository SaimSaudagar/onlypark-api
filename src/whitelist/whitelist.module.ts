import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhitelistController } from './whitelist.controller';
import { WhitelistService } from './whitelist.service';
import { Whitelist } from './entities/whitelist.entity';
import { SubCarPark } from '../sub-car-park/entities/sub-car-park.entity';
import { Tenancy } from '../tenancy/entities/tenancy.entity';
import { EmailNotificationModule } from '../common/services/email/email-notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Whitelist, SubCarPark, Tenancy]),
        EmailNotificationModule,
    ],
    controllers: [WhitelistController],
    providers: [WhitelistService],
    exports: [WhitelistService],
})
export class WhitelistModule { }
