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
import { InfringementService } from './infringement.service';
import {
  CreateInfringementRequest,
  UpdateInfringementRequest,
} from './infringement.dto';

@ApiTags('Infringement')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'infringement', version: '1' })
export class InfringementController {
  constructor(private readonly infringementService: InfringementService) {}

  @Get()
  findAll() {
    return this.infringementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.infringementService.findOne({ where: { ticketNumber: parseInt(id) } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInfringementDto: CreateInfringementRequest) {
    return this.infringementService.create(createInfringementDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInfringementDto: UpdateInfringementRequest) {
    return this.infringementService.update(id, updateInfringementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.infringementService.remove(id);
  }
}
