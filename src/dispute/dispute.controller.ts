import {
    Controller,
    Post,
    Body,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import { CreateDisputeRequest, CreateDisputeResponse } from './dispute.dto';

@ApiTags('Dispute')
@Controller({ path: 'dispute', version: '1' })
export class DisputeController {
    constructor(private readonly disputeService: DisputeService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() request: CreateDisputeRequest): Promise<CreateDisputeResponse> {
        return this.disputeService.create(request);
    }
}
