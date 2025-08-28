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
import { User } from '../common/decorators';
import { AuthenticatedUser } from '../common';
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { SubCarParkService } from './sub-car-park.service';
import {
  CreateSubCarParkRequest,
  UpdateSubCarParkRequest,
} from './dto/sub-car-park.dto';

@ApiTags('SubCarPark')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'sub-car-park', version: '1' })
export class SubCarParkController {
  constructor(private readonly subCarParkService: SubCarParkService) {}

  @Get()
  findAll() {
    return this.subCarParkService.findAll();
  }

  @Get('master/:masterCarParkId')
  findByMasterCarPark(@Param('masterCarParkId') masterCarParkId: string) {
    return this.subCarParkService.findByMasterCarPark(masterCarParkId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCarParkService.findOne({ where: { id } });
  }

  @Get(':id/qr-code')
  @HttpCode(HttpStatus.OK)
  async getQrCode(@Param('id') id: string) {
    const qrCode = await this.subCarParkService.generateQrCode(id);
    return { qrCode };
  }

  @Get(':id/availability')
  @HttpCode(HttpStatus.OK)
  async getAvailability(@Param('id') id: string) {
    return await this.subCarParkService.getAvailability(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSubCarParkDto: CreateSubCarParkRequest) {
    return this.subCarParkService.create(createSubCarParkDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubCarParkDto: UpdateSubCarParkRequest,
  ) {
    return this.subCarParkService.update(id, updateSubCarParkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.subCarParkService.remove(id);
  }
}
