import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MasterCarParkService } from './master-car-park.service';
import { FindMasterCarParkRequest, FindMasterCarParkResponse } from './master-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from '../../auth/guards/roles.guard';
import { UserType } from '../../common/enums';
import { RoleGuard } from '../../auth/guards/roles.guard';

@ApiTags('Carpark Manager => Master Car Park')
@Controller({ path: 'carpark-manager/master-car-park', version: '1' })
export class MasterCarParkController {
    constructor(private readonly masterCarParkService: MasterCarParkService) { }

    @Get('list')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    async findAll(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findAll(request);
    }

    @Get('visitor')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    async findVisitorMasterCarParks(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findByAssignmentType(request, 'visitor');
    }

    @Get('whitelist')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    async findWhitelistMasterCarParks(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findByAssignmentType(request, 'whitelist');
    }

    @Get('blacklist')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    async findBlacklistMasterCarParks(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findByAssignmentType(request, 'blacklist');
    }
}
