import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MasterCarParkService } from './master-car-park.service';
import { FindMasterCarParkRequest, FindMasterCarParkResponse } from './master-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Patrol Officer => Master Car Park')
@Controller('patrol-officer/master-car-park')
@UseGuards(JwtAuthenticationGuard)
export class MasterCarParkController {
    constructor(private readonly masterCarParkService: MasterCarParkService) { }

    @Get()
    async findAll(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findAll(request);
    }
}
