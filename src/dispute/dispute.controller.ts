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
import { RoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission, UserPermission, CarparkManagerPermission, PatrolOfficerPermission, DisputeStatus } from '../common/enums';
import { DisputeService } from './dispute.service';
import {
    CreateDisputeRequest,
    FindDisputeRequest,
    UpdateDisputeRequest,
    UpdateDisputeStatusRequest,
} from './dispute.dto';

@ApiTags('Dispute')
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'dispute', version: '1' })
export class DisputeController {
    constructor(private readonly disputeService: DisputeService) { }

    @Get()
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    @RequirePermissions(AdminPermission.DISPUTE_LIST, CarparkManagerPermission.DISPUTE_LIST, UserPermission.DISPUTE_LIST, PatrolOfficerPermission.DISPUTE_LIST)
    findAll(@Query() request: FindDisputeRequest) {
        return this.disputeService.findAll(request);
    }

    @Get(':id')
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    @RequirePermissions(AdminPermission.DISPUTE_VIEW, CarparkManagerPermission.DISPUTE_VIEW, UserPermission.DISPUTE_VIEW, PatrolOfficerPermission.DISPUTE_VIEW)
    findById(@Param('id') id: string) {
        return this.disputeService.findById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    @RequirePermissions(AdminPermission.DISPUTE_CREATE, CarparkManagerPermission.DISPUTE_CREATE, PatrolOfficerPermission.DISPUTE_CREATE)
    create(@Body() request: CreateDisputeRequest) {
        return this.disputeService.create(request);
    }

    @Patch('/update-status')
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    @RequirePermissions(AdminPermission.DISPUTE_EDIT, CarparkManagerPermission.DISPUTE_EDIT, PatrolOfficerPermission.DISPUTE_EDIT)
    updateStatus(@Query() request: UpdateDisputeStatusRequest) {
        return this.disputeService.updateStatus(request);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
    @RequirePermissions(AdminPermission.DISPUTE_DELETE, CarparkManagerPermission.DISPUTE_DELETE)
    remove(@Param('id') id: string) {
        return this.disputeService.remove(id);
    }
}
