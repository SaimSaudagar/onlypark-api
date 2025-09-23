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
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RoleGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { UserType, AdminPermission, UserPermission, CarparkManagerPermission, PatrolOfficerPermission } from '../../common/enums';
import { InfringementService } from './infringement.service';
import {
  CreateInfringementRequest,
  UpdateInfringementRequest,
  UpdateInfringementStatusRequest,
  ScanInfringementRequest,
  FindInfringementRequest,
  GetTicketResponse,
  GetTicketRequest,
} from './infringement.dto';


@ApiTags('Admin => Infringement')
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: 'admin/infringement', version: '1' })
export class InfringementController {
  constructor(private readonly infringementService: InfringementService) { }

  @Get()
  findAll(@Query() request: FindInfringementRequest) {
    return this.infringementService.findAll(request);
  }

  @Get('ticket')
  getTicket(@Query() request: GetTicketRequest): Promise<GetTicketResponse> {
    return this.infringementService.getTicket(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.infringementService.findById(id);
  }

  @Post('scan')
  @HttpCode(HttpStatus.CREATED)
  scan(@Body() request: ScanInfringementRequest) {
    return this.infringementService.scan(request);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() request: CreateInfringementRequest) {
    return this.infringementService.create(request);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() request: UpdateInfringementRequest) {
    return this.infringementService.update(id, request);
  }

  @Patch('mark-as-waived/:id')
  markAsWaived(@Param('id') id: string) {
    return this.infringementService.markAsWaived(id);
  }

  @Patch('update-status/:id')
  updateStatus(@Param('id') id: string, @Body() request: UpdateInfringementStatusRequest) {
    return this.infringementService.updateStatus(id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.infringementService.remove(id);
  }

  @Get('penalty/:infringementCarParkId')
  getPenalty(@Param('infringementCarParkId') infringementCarParkId: string) {
    return this.infringementService.getPenalty(infringementCarParkId);
  }



  @Get('ticket/:ticketNumber/png')
  async getTicketPng(@Param('ticketNumber') ticketNumber: number, @Res() res: Response): Promise<void> {
    const pngBuffer = await this.infringementService.generateTicketPng(ticketNumber);
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename=ticket.png',
      'Content-Length': pngBuffer.length.toString(),
    });
    
    res.send(pngBuffer);
  }
}
