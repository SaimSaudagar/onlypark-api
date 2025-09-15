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
import { OutstandingRegistrationService } from './outstanding-registration.service';

@ApiTags('OutstandingRegistration')
@Controller({ path: 'outstanding-registration', version: '1' })
export class OutstandingRegistrationController {
  constructor(private readonly outstandingRegistrationService: OutstandingRegistrationService) { }

  @Get()
  findAll() {
    return this.outstandingRegistrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.outstandingRegistrationService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: any) {
    return this.outstandingRegistrationService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.outstandingRegistrationService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.outstandingRegistrationService.remove(id);
  }
}
