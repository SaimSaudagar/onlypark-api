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
import { WhitelistService } from './whitelist.service';

@ApiTags('Whitelist')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'whitelist', version: '1' })
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

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
  create(@Body() createDto: any) {
    return this.whitelistService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.whitelistService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.whitelistService.remove(id);
  }
}
