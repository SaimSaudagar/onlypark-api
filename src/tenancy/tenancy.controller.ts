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
import { TenancyService } from './tenancy.service';

@ApiTags('Tenancy')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'tenancy', version: '1' })
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Get()
  findAll() {
    return this.tenancyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenancyService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: any) {
    return this.tenancyService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.tenancyService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tenancyService.remove(id);
  }
}
