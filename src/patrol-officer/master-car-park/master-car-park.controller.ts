import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MasterCarParkService } from './master-car-park.service';
import { FindMasterCarParkRequest, FindMasterCarParkResponse } from './master-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Patrol Officer => Master Car Park')
@Controller({ path: 'patrol-officer/master-car-park', version: '1' })
@UseGuards(JwtAuthenticationGuard)
export class MasterCarParkController {
    constructor(private readonly masterCarParkService: MasterCarParkService) { }

    @Get('list')
    async findAll(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findAll(request);
    }

    @Get('visitor')
    async findVisitorMasterCarParks(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findByAssignmentType(request, 'visitor');
    }

    @Get('whitelist')
    async findWhitelistMasterCarParks(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findByAssignmentType(request, 'whitelist');
    }

    @Get('blacklist')
    async findBlacklistMasterCarParks(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findByAssignmentType(request, 'blacklist');
    }
}
