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
import { MasterCarParkService } from './master-car-park.service';
import {
  CreateMasterCarParkRequest,
  UpdateMasterCarParkRequest,
} from './dto/master-car-park.dto';

@ApiTags('MasterCarPark')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'master-car-park', version: '1' })
export class MasterCarParkController {
  constructor(private readonly masterCarParkService: MasterCarParkService) {}

  @Get()
  findAll() {
    return this.masterCarParkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterCarParkService.findOne({ where: { id } });
  }

  @Get(':id/qr-code')
  @HttpCode(HttpStatus.OK)
  async getQrCode(@Param('id') id: string) {
    const qrCode = await this.masterCarParkService.generateQrCode(id);
    return { qrCode };
  }

  @Get(':id/statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics(@Param('id') id: string) {
    return await this.masterCarParkService.getStatistics(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMasterCarParkDto: CreateMasterCarParkRequest) {
    return this.masterCarParkService.create(createMasterCarParkDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterCarParkDto: UpdateMasterCarParkRequest,
  ) {
    return this.masterCarParkService.update(id, updateMasterCarParkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.masterCarParkService.remove(id);
  }
}
