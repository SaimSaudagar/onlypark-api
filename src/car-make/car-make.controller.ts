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
import { CarMakeService } from './car-make.service';
import {
  CreateCarMakeRequest,
  UpdateCarMakeRequest,
} from './car-make.dto';

@ApiTags('CarMake')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'car-make', version: '1' })
export class CarMakeController {
  constructor(private readonly carMakeService: CarMakeService) {}

  @Get()
  findAll() {
    return this.carMakeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carMakeService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCarMakeDto: CreateCarMakeRequest) {
    return this.carMakeService.create(createCarMakeDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarMakeDto: UpdateCarMakeRequest) {
    return this.carMakeService.update(id, updateCarMakeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.carMakeService.remove(id);
  }
}
