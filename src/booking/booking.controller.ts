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
import { UserType, AdminPermission, UserPermission, CarparkManagerPermission, PatrolOfficerPermission } from '../common/enums';
import { BookingService } from './booking.service';
import {
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingResponse,
  BookingListResponse,
  BookingCreateResponse,
  BookingUpdateResponse,
  BookingDeleteResponse,
} from './booking.dto';

@ApiTags('Booking')
@JwtAuthGuardWithApiBearer()
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'booking', version: '1' })
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Get()
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.BOOKING_LIST, CarparkManagerPermission.BOOKING_LIST)
  findAll(): Promise<BookingListResponse[]> {
    return this.bookingService.findAll();
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  findOne(@Param('id') id: string): Promise<BookingResponse | null> {
    return this.bookingService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  create(@Body() request: CreateBookingRequest): Promise<BookingCreateResponse> {
    return this.bookingService.create(request);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  update(@Param('id') id: string, @Body() updateDto: UpdateBookingRequest): Promise<BookingUpdateResponse> {
    return this.bookingService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER, UserType.PATROL_OFFICER)
  remove(@Param('id') id: string): Promise<BookingDeleteResponse> {
    return this.bookingService.remove(id);
  }
}

