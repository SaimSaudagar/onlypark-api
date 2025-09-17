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
import { CreateWhitelistDto, UpdateWhitelistDto } from './whitelist.dto';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { AllowedRoles } from '../../auth/guards/roles.guard';
import { UserType } from '../../common/enums';
import { RoleGuard } from '../../auth/guards/roles.guard';

@ApiTags('Admin => Whitelist')
@Controller({ path: 'admin/whitelist', version: '1' })
export class WhitelistController {
    constructor(private readonly whitelistService: WhitelistService) { }

    @Get()
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.ADMIN)
    findAll(@Query() query: any) {
        return this.whitelistService.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.ADMIN)
    findOne(@Param('id') id: string) {
        return this.whitelistService.findOne({ where: { id } });
    }

    @Patch(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.ADMIN)
    update(@Param('id') id: string, @Body() updateDto: UpdateWhitelistDto) {
        return this.whitelistService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.ADMIN)
    remove(@Param('id') id: string) {
        return this.whitelistService.remove(id);
    }
}
