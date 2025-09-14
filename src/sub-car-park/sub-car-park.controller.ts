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
import { ApiGetBaseResponse } from '../common';
import { SubCarParkService } from './sub-car-park.service';
import {
  CreateSubCarParkRequest,
  UpdateSubCarParkRequest,
  FindSubCarParkResponse,
  SubCarParkCreateResponse,
  SubCarParkUpdateResponse,
  SubCarParkDeleteResponse,
  FindSubCarParkRequest,
  FindAllSubCarParkResponse,
} from './sub-car-park.dto';

@ApiTags('SubCarPark')
@Controller({ path: 'sub-car-park', version: '1' })
export class SubCarParkController {
  constructor(private readonly subCarParkService: SubCarParkService) { }

  @Get()
  findAll(@Query() request: FindSubCarParkRequest): Promise<ApiGetBaseResponse<FindAllSubCarParkResponse>> {
    return this.subCarParkService.findAll(request);
  }

  @Get('master/:masterCarParkId')
  findByMasterCarPark(@Param('masterCarParkId') masterCarParkId: string): Promise<FindSubCarParkResponse[]> {
    return this.subCarParkService.findByMasterCarPark(masterCarParkId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FindSubCarParkResponse> {
    return this.subCarParkService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() request: CreateSubCarParkRequest): Promise<SubCarParkCreateResponse> {
    return this.subCarParkService.create(request);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() request: UpdateSubCarParkRequest,
  ): Promise<SubCarParkUpdateResponse> {
    return this.subCarParkService.update(id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<SubCarParkDeleteResponse> {
    return this.subCarParkService.remove(id);
  }
}
