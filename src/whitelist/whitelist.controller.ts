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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuardWithApiBearer } from '../auth/guards/jwt-auth.guard';
import { WhitelistService } from './whitelist.service';
import { CreateWhitelistDto, UpdateWhitelistDto, WhitelistResponseDto } from './whitelist.dto';

@ApiTags('Whitelist')
@JwtAuthGuardWithApiBearer()
@Controller({ path: 'whitelist', version: '1' })
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) { }

  @Get()
  @ApiOperation({ summary: 'Get all whitelist entries' })
  @ApiResponse({
    status: 200,
    description: 'List of whitelist entries retrieved successfully',
    type: [WhitelistResponseDto]
  })
  findAll() {
    return this.whitelistService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get whitelist entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Whitelist entry retrieved successfully',
    type: WhitelistResponseDto
  })
  @ApiResponse({ status: 404, description: 'Whitelist entry not found' })
  findOne(@Param('id') id: string) {
    return this.whitelistService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateWhitelistDto) {
    return this.whitelistService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWhitelistDto) {
    return this.whitelistService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.whitelistService.remove(id);
  }
}
