import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { VisitorBookingService } from './visitor-booking.service';
import {
    CreateVisitorBookingRequest,
    CreateVisitorBookingResponse,
    GetBookingByTokenResponse,
} from './visitor-booking.dto';

@ApiTags('Visitor Bookings')
@Controller('visitor-bookings')
export class VisitorBookingController {
    constructor(private readonly visitorBookingService: VisitorBookingService) { }

    @Post()
    async create(
        @Body() createVisitorBookingDto: CreateVisitorBookingRequest,
    ): Promise<CreateVisitorBookingResponse> {
        return await this.visitorBookingService.create(createVisitorBookingDto);
    }

    @Get(':token')
    async getBookingByToken(@Param('token') token: string): Promise<GetBookingByTokenResponse> {
        return await this.visitorBookingService.getBookingByToken(token);
    }
}
