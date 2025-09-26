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
    UseGuards,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { UserType, AdminPermission, UserPermission, CarparkManagerPermission, PatrolOfficerPermission, DisputeStatus } from '../../common/enums';
import { DisputeService } from './dispute.service';
import {
    CreateDisputeRequest,
    FindDisputeRequest,
    UpdateDisputeRequest,
    UpdateDisputeStatusRequest,
} from './dispute.dto';

@ApiTags('Admin => Dispute')
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'admin/dispute', version: '1' })
export class DisputeController {
    constructor(private readonly disputeService: DisputeService) { }

    @Get()
    @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
    findAll(@Query() request: FindDisputeRequest) {
        return this.disputeService.findAll(request);
    }

    @Get(':id')
    @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
    findById(@Param('id') id: string) {
        return this.disputeService.findById(id);
    }


    @Patch('update/:id')
    @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() request: UpdateDisputeRequest) {
        return this.disputeService.update(id, request);
    }

    @Patch('/update-status')
    @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
    updateStatus(@Query() request: UpdateDisputeStatusRequest) {
        return this.disputeService.updateStatus(request);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.disputeService.remove(id);
    }
}
