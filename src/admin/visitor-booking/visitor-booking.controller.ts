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
import JwtAuthenticationGuard from '../../auth/guards/jwt-auth.guard';
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

@ApiTags('Admin => Visitor Booking')
@Controller({ path: 'admin/visitor-booking', version: '1' })
@UseGuards(JwtAuthenticationGuard)
export class VisitorBookingController {
    constructor(private readonly visitorBookingService: VisitorBookingService) { }

    @Get()
    findAll(): Promise<VisitorBookingListResponse[]> {
        return this.visitorBookingService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<VisitorBookingResponse | null> {
        return this.visitorBookingService.findOne({ where: { id } });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() request: CreateVisitorBookingRequest): Promise<VisitorBookingCreateResponse> {
        return this.visitorBookingService.create(request);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateVisitorBookingRequest)
    // :Promise<VisitorBookingUpdateResponse> 
    {
        // return this.visitorBookingService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(@Param('id') id: string): Promise<VisitorBookingDeleteResponse> {
        return this.visitorBookingService.remove(id);
    }
}
