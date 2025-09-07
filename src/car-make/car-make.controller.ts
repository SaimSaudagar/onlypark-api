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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard, { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { CarMakeService } from './car-make.service';
import {
  CreateCarMakeRequest,
  UpdateCarMakeRequest,
} from './car-make.dto';
import { RoleGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permission.guard';

@ApiTags('CarMake')
@Controller({ path: 'car-make', version: '1' })
export class CarMakeController {
  constructor(private readonly carMakeService: CarMakeService) {}

  @Get()
  findAll() {
    return this.carMakeService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard, RoleGuard, PermissionsGuard)
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
