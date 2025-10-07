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
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WhitelistService } from './whitelist.service';
import { CreateWhitelistRequest, CreateWhitelistResponse, FindWhitelistRequest, FindWhitelistResponse, UpdateWhitelistRequest } from './whitelist.dto';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { AllowedRoles } from '../../auth/guards/roles.guard';
import { UserType } from '../../common/enums';
import { RoleGuard } from '../../auth/guards/roles.guard';
import { ApiGetBaseResponse } from '../../common';

@ApiTags('Admin => Whitelist')
@Controller({ path: 'admin/whitelist', version: '1' })
export class WhitelistController {
    constructor(private readonly whitelistService: WhitelistService) { }

    @Get()
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    findAll(@Query() request: FindWhitelistRequest): Promise<ApiGetBaseResponse<FindWhitelistResponse>> {
        return this.whitelistService.findAll(request);
    }

    @Post()
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    create(@Body() request: CreateWhitelistRequest): Promise<CreateWhitelistResponse> {
        return this.whitelistService.create(request);
    }

    @Get(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    findOne(@Param('id') id: string) {
        return this.whitelistService.findOne({ where: { id } });
    }

    @Patch(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    update(@Param('id') id: string, @Body() request: UpdateWhitelistRequest) {
        return this.whitelistService.update(id, request);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    remove(@Param('id') id: string) {
        return this.whitelistService.remove(id);
    }

    @Patch('checkout/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.SUPER_ADMIN, UserType.ADMIN)
    checkout(@Param('id') id: string): Promise<void> {
        return this.whitelistService.checkout(id);
    }
}