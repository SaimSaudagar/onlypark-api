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
import { TenancyService } from './tenancy.service';
import { CreateTenancyRequest, FindTenancyRequest, FindTenancyResponse } from './tenancy.dto';
import { ApiGetBaseResponse } from '../common/types';

@ApiTags('Tenancy')
@Controller({ path: 'tenancy', version: '1' })
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) { }

  @Get()
  findAll(@Query() request: FindTenancyRequest): Promise<ApiGetBaseResponse<FindTenancyResponse>> {
    return this.tenancyService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenancyService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() request: CreateTenancyRequest) {
    return this.tenancyService.create(request);
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
