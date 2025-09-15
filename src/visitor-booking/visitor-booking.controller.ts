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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permission.decorator';
import { PermissionsGuard } from '../common/guards/permission.guard';
import { UserType, AdminPermission, CarparkManagerPermission } from '../common/enums';
import { VisitorBookingService } from './visitor-booking.service';
import {
    CreateVisitorBookingRequest,
    UpdateVisitorBookingRequest,
    VisitorBookingResponse,
    VisitorBookingListResponse,
    VisitorBookingCreateResponse,
    VisitorBookingUpdateResponse,
    VisitorBookingDeleteResponse,
} from './visitor-booking.dto';

@ApiTags('Visitor Booking')
@JwtAuthGuardWithApiBearer()
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'visitor-booking', version: '1' })
export class VisitorBookingController {
    constructor(private readonly visitorBookingService: VisitorBookingService) { }

    @Get()
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
    @RequirePermissions(AdminPermission.BOOKING_LIST, CarparkManagerPermission.BOOKING_LIST)
    findAll(): Promise<VisitorBookingListResponse[]> {
        return this.visitorBookingService.findAll();
    }

    @Get(':id')
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    findOne(@Param('id') id: string): Promise<VisitorBookingResponse | null> {
        return this.visitorBookingService.findOne({ where: { id } });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    create(@Body() request: CreateVisitorBookingRequest): Promise<VisitorBookingCreateResponse> {
        return this.visitorBookingService.create(request);
    }

    @Patch(':id')
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    update(@Param('id') id: string, @Body() updateDto: UpdateVisitorBookingRequest)
    // :Promise<VisitorBookingUpdateResponse> 
    {
        // return this.visitorBookingService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
    remove(@Param('id') id: string): Promise<VisitorBookingDeleteResponse> {
        return this.visitorBookingService.remove(id);
    }
}
