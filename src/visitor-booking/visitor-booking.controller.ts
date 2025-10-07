import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VisitorBookingService } from './visitor-booking.service';
import {
    CreateVisitorBookingRequest,
    CreateVisitorBookingResponse,
    GetBookingByTokenResponse,
} from './visitor-booking.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Visitor Bookings')
@Controller('visitor-bookings')
export class VisitorBookingController {
    constructor(private readonly visitorBookingService: VisitorBookingService) { }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    async create(
        @Body() createVisitorBookingDto: CreateVisitorBookingRequest,
    ): Promise<CreateVisitorBookingResponse> {
        return await this.visitorBookingService.create(createVisitorBookingDto);
    }

    @Get(':token')
    @UseGuards(OptionalJwtAuthGuard)
    async getBookingByToken(@Param('token') token: string): Promise<GetBookingByTokenResponse> {
        return await this.visitorBookingService.getBookingByToken(token);
    }

    @Post('verify-tenant/:token')
    async verifyTenantEmail(@Param('token') token: string): Promise<CreateVisitorBookingResponse> {
        return await this.visitorBookingService.verifyTenantEmail(token);
    }
}
