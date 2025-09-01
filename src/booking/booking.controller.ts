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

@ApiTags('Booking')
@JwtAuthGuardWithApiBearer()
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'booking', version: '1' })
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Get()
  @Roles(UserType.ADMIN, UserType.CARPARK_MANAGER)
  @RequirePermissions(AdminPermission.BOOKING_LIST, CarparkManagerPermission.BOOKING_LIST)
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: any) {
    return this.bookingService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.bookingService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}

