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
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { WhitelistCompanyService } from './whitelist-company.service';
import {
    CreateWhitelistCompanyDto,
    UpdateWhitelistCompanyDto,
    WhitelistCompanyResponseDto
} from './whitelist-company.dto';

@ApiTags('Whitelist Company')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'whitelist-company', version: '1' })
export class WhitelistCompanyController {
    constructor(private readonly whitelistCompanyService: WhitelistCompanyService) { }

    @Get()
    findAll(
        @Query('subCarParkId') subCarParkId?: string,
        @Query('tenancyId') tenancyId?: string,
        @Query('isActive') isActive?: string,
    ) {
        const options: any = {};

        if (subCarParkId) {
            options.where = { ...options.where, subCarParkId };
        }

        if (tenancyId) {
            options.where = { ...options.where, tenancyId };
        }

        if (isActive !== undefined) {
            options.where = { ...options.where, isActive: isActive === 'true' };
        }

        return this.whitelistCompanyService.findAll(options);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.whitelistCompanyService.findOne({ where: { id } });
    }

    @Get('sub-car-park/:subCarParkId')
    findBySubCarPark(@Param('subCarParkId') subCarParkId: string) {
        return this.whitelistCompanyService.findBySubCarPark(subCarParkId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDto: CreateWhitelistCompanyDto) {
        return this.whitelistCompanyService.create(createDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateWhitelistCompanyDto) {
        return this.whitelistCompanyService.update(id, updateDto);
    }

    @Patch(':id/toggle-active')
    toggleActiveStatus(@Param('id') id: string) {
        return this.whitelistCompanyService.toggleActiveStatus(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.whitelistCompanyService.remove(id);
    }
}
