import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SubCarParkService } from './sub-car-park.service';
import { FindSubCarParkRequest, FindSubCarParkResponse } from './sub-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from '../../auth/guards/roles.guard';
import { UserType } from '../../common/enums';
import { RoleGuard } from '../../auth/guards/roles.guard';

@ApiTags('Carpark Manager => Sub Car Park')
@Controller({ path: 'carpark-manager/sub-car-park', version: '1' })
export class SubCarParkController {
    constructor(private readonly subCarParkService: SubCarParkService) { }

    @Get()
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    async findAll(
        @Query() request: FindSubCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindSubCarParkResponse>> {
        return await this.subCarParkService.findAll(request);
    }

    @Get('visitor')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    async findVisitorSubCarParks(
        @Query() request: FindSubCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindSubCarParkResponse>> {
        return await this.subCarParkService.findByAssignmentType(request, 'visitor');
    }

    @Get('whitelist')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    async findWhitelistSubCarParks(
        @Query() request: FindSubCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindSubCarParkResponse>> {
        return await this.subCarParkService.findByAssignmentType(request, 'whitelist');
    }

}
