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
import { PatrolOfficerService } from './patrol-officer.service';

@ApiTags('PatrolOfficer')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'patrol-officer', version: '1' })
export class PatrolOfficerController {
  constructor(private readonly patrolOfficerService: PatrolOfficerService) { }

  @Get()
  findAll() {
    return this.patrolOfficerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patrolOfficerService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: any) {
    return this.patrolOfficerService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.patrolOfficerService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.patrolOfficerService.remove(id);
  }
}
