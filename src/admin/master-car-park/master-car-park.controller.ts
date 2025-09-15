import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { MasterCarParkService } from './master-car-park.service';
import {
    CreateMasterCarParkRequest,
    UpdateMasterCarParkRequest,
    CreateMasterCarParkResponse,
    FindMasterCarParkRequest,
    FindMasterCarParkResponse,
    UpdateMasterCarParkStatusRequest,
    UpdateMasterCarParkStatusResponse,
    FindMasterCarParkByIdResponse,
    UpdateMasterCarParkResponse,
} from './master-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { UserType } from '../../common/enums';
import { AllowedRoles } from '../../auth/guards/roles.guard';
import { RoleGuard } from '../../auth/guards/roles.guard';

@ApiTags('Admin => Master Car Park')
@Controller({ path: 'admin/master-car-park', version: '1' })
export class MasterCarParkController {
    constructor(private readonly masterCarParkService: MasterCarParkService) { }
    @Get('list')
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    async findAll(
        @Query() request: FindMasterCarParkRequest,
    ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        return await this.masterCarParkService.findAll(request);
    }

    @Get(':id')
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    async findById(@Param('id') id: string): Promise<FindMasterCarParkByIdResponse> {
        return await this.masterCarParkService.findById(id);
    }

    @Post()
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    async create(@Body() request: CreateMasterCarParkRequest): Promise<CreateMasterCarParkResponse> {
        return await this.masterCarParkService.create(request);
    }


    @Patch(':id')
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    async update(
        @Param('id') id: string,
        @Body() request: UpdateMasterCarParkRequest,
    ): Promise<UpdateMasterCarParkResponse> {
        return await this.masterCarParkService.update(id, request);
    }

    @Patch(':id/status')
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    async updateStatus(
        @Param('id') id: string,
        @Body() request: UpdateMasterCarParkStatusRequest,
    ): Promise<UpdateMasterCarParkStatusResponse> {
        return await this.masterCarParkService.updateStatus(id, request);
    }

    @Delete(':id')
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    async remove(@Param('id') id: string): Promise<void> {
        return await this.masterCarParkService.remove(id);
    }
}
