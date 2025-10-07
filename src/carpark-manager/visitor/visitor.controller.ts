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
import { VisitorService } from './visitor.service';
import { CreateVisitorRequest, FindVisitorRequest, UpdateVisitorRequest } from './visitor.dto';
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
import { AllowedRoles } from '../../auth/guards/roles.guard';
import { UserType } from '../../common/enums';
import { RoleGuard } from '../../auth/guards/roles.guard';

@ApiTags('Carpark Manager => Visitor')
@Controller({ path: 'carpark-manager/visitor', version: '1' })
export class VisitorController {
    constructor(private readonly visitorService: VisitorService) { }

    @Get()
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    findAll(@Query() request: FindVisitorRequest) {
        return this.visitorService.findAll(request);
    }

    @Get('assigned-sub-car-parks')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    getAssignedSubCarParks() {
        return this.visitorService.getAssignedSubCarParks();
    }

    @Get(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    findOne(@Param('id') id: string) {
        return this.visitorService.findOne({ where: { id } });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    create(@Body() request: CreateVisitorRequest) {
        return this.visitorService.create(request);
    }

    @Patch(':id')
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    update(@Param('id') id: string, @Body() request: UpdateVisitorRequest) {
        return this.visitorService.update(id, request);
    }

    @Patch('checkout/:id')
    @AllowedRoles(UserType.CARPARK_MANAGER)
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    checkout(@Param('id') id: string): Promise<void> {
        return this.visitorService.checkout(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthenticationGuard, RoleGuard)
    @AllowedRoles(UserType.CARPARK_MANAGER)
    remove(@Param('id') id: string) {
        return this.visitorService.remove(id);
    }
}
