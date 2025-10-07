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
import { CreateWhitelistRequest, FindWhitelistRequest, UpdateWhitelistRequest } from './whitelist.dto';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { AllowedRoles } from '../../auth/guards/roles.guard';
import { UserType } from '../../common/enums';
import { RoleGuard } from '../../auth/guards/roles.guard';

@ApiTags('Carpark Manager => Whitelist')
@Controller({ path: 'carpark-manager/whitelist', version: '1' })
export class WhitelistController {
    constructor(private readonly whitelistService: WhitelistService) { }

    @Get()
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    findAll(@Query() request: FindWhitelistRequest) {
        return this.whitelistService.findAll(request);
    }

    @Get(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    findOne(@Param('id') id: string) {
        return this.whitelistService.findOne({ where: { id } });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    create(@Body() request: CreateWhitelistRequest) {
        return this.whitelistService.create(request);
    }

    @Patch(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    update(@Param('id') id: string, @Body() request: UpdateWhitelistRequest) {
        return this.whitelistService.update(id, request);
    }

    @Patch('checkout/:id')
    @AllowedRoles(UserType.CARPARK_MANAGER)
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    checkout(@Param('id') id: string): Promise<void> {
        return this.whitelistService.checkout(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    remove(@Param('id') id: string) {
        return this.whitelistService.remove(id);
    }
}
