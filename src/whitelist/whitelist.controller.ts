import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WhitelistService } from './whitelist.service';
import { CreateWhitelistDto, UpdateWhitelistDto } from './whitelist.dto';

@ApiTags('Whitelist')
@Controller({ path: 'whitelist', version: '1' })
export class WhitelistController {
    constructor(private readonly whitelistService: WhitelistService) { }

    @Get()
    findAll() {
        return this.whitelistService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.whitelistService.findOne({ where: { id } });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDto: CreateWhitelistDto) {
        return this.whitelistService.create(createDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateWhitelistDto) {
        return this.whitelistService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.whitelistService.remove(id);
    }
}
