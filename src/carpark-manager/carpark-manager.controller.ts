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
import { CarparkManagerService } from './carpark-manager.service';
import {
  CreateCarparkManagerRequest,
  UpdateCarparkManagerRequest,
} from './carpark-manager.dto';

@ApiTags('CarparkManager')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'carpark-manager', version: '1' })
export class CarparkManagerController {
  constructor(private readonly carparkManagerService: CarparkManagerService) {}

  @Get()
  findAll() {
    return this.carparkManagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carparkManagerService.findOne({ where: { id }, relations: ['user'] });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCarparkManagerDto: CreateCarparkManagerRequest) {
    return this.carparkManagerService.create(createCarparkManagerDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarparkManagerDto: UpdateCarparkManagerRequest) {
    return this.carparkManagerService.update(id, updateCarparkManagerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.carparkManagerService.remove(id);
  }
}
