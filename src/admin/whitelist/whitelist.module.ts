import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhitelistController } from './whitelist.controller';
import { WhitelistService } from './whitelist.service';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Whitelist])],
    controllers: [WhitelistController],
    providers: [WhitelistService],
    exports: [WhitelistService],
})
export class WhitelistModule { }
