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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { BlacklistService } from './blacklist.service';
import { CreateBlacklistRequest, FindBlacklistRequest, UpdateBlacklistRequest } from './blacklist.dto';

@ApiTags('Blacklist')
@Controller({ path: 'blacklist', version: '1' })
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) { }

  @Get()
  findAll(@Query() request: FindBlacklistRequest) {
    return this.blacklistService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blacklistService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() request: CreateBlacklistRequest) {
    return this.blacklistService.create(request);
  }

  @Patch()
  update(@Body() request: UpdateBlacklistRequest) {
    return this.blacklistService.update(request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blacklistService.remove(id);
  }
}
