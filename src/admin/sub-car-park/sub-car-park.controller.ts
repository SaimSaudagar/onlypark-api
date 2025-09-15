import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { SubCarParkService } from './sub-car-park.service';
import {
    CreateSubCarParkRequest,
    UpdateSubCarParkRequest,
    SubCarParkCreateResponse,
    SubCarParkUpdateResponse,
    SubCarParkDeleteResponse,
    FindSubCarParkRequest,
    FindSubCarParkResponse,
    FindAllSubCarParkResponse,
} from './sub-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin => Sub Car Park')
@Controller({ path: 'admin/sub-car-park', version: '1' })
@UseGuards(JwtAuthenticationGuard)
export class SubCarParkController {
    constructor(private readonly subCarParkService: SubCarParkService) { }

    @Post()
    async create(@Body() request: CreateSubCarParkRequest): Promise<SubCarParkCreateResponse> {
        return await this.subCarParkService.create(request);
    }

    @Get()
    async findAll(
        @Query() request: FindSubCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindAllSubCarParkResponse>> {
        return await this.subCarParkService.findAll(request);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<FindSubCarParkResponse> {
        return await this.subCarParkService.findOne({ where: { id } });
    }

    @Get('master-car-park/:masterCarParkId')
    async findByMasterCarPark(@Param('masterCarParkId') masterCarParkId: string): Promise<FindSubCarParkResponse[]> {
        return await this.subCarParkService.findByMasterCarPark(masterCarParkId);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() request: UpdateSubCarParkRequest,
    ): Promise<SubCarParkUpdateResponse> {
        return await this.subCarParkService.update(id, request);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<SubCarParkDeleteResponse> {
        return await this.subCarParkService.remove(id);
    }
}
