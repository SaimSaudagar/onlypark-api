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
  @ApiOperation({ summary: 'Create whitelist entry' })
  @ApiResponse({
    status: 201,
    description: 'Whitelist entry created successfully',
    type: WhitelistResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createDto: CreateWhitelistDto) {
    return this.whitelistService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update whitelist entry' })
  @ApiResponse({
    status: 200,
    description: 'Whitelist entry updated successfully',
    type: WhitelistResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Whitelist entry not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateWhitelistDto) {
    return this.whitelistService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete whitelist entry' })
  @ApiResponse({
    status: 204,
    description: 'Whitelist entry deleted successfully'
  })
  @ApiResponse({ status: 404, description: 'Whitelist entry not found' })
  remove(@Param('id') id: string) {
    return this.whitelistService.remove(id);
  }
}
