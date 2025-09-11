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
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { BlacklistService } from './blacklist.service';
import { CreateBlacklistDto, UpdateBlacklistDto } from './blacklist.dto';

@ApiTags('Blacklist')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'blacklist', version: '1' })
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) { }

  @Get()
  findAll() {
    return this.blacklistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blacklistService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBlacklistDto: CreateBlacklistDto) {
    return this.blacklistService.create(createBlacklistDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlacklistDto: UpdateBlacklistDto) {
    return this.blacklistService.update(id, updateBlacklistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blacklistService.remove(id);
  }
}
