import {
    Controller,
    Post,
    Body,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WhitelistService } from './whitelist.service';
import { CreateSelfServeWhitelistRequest, CreateSelfServeWhitelistResponse } from './whitelist.dto';

@ApiTags('Whitelist')
@Controller({ path: 'whitelist', version: '1' })
export class WhitelistController {
    constructor(private readonly whitelistService: WhitelistService) { }

    @Post('self-serve')
    @HttpCode(HttpStatus.CREATED)
    createSelfServeWhitelist(@Body() request: CreateSelfServeWhitelistRequest): Promise<CreateSelfServeWhitelistResponse> {
        return this.whitelistService.createSelfServeWhitelist(request);
    }
}
