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
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import {
    CreateProfileRequest,
    UpdateProfileRequest,
} from './profile.dto';

@ApiTags('Carpark Manager => Profile')
@Controller({ path: 'carpark-manager/profile', version: '1' })
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    findAll() {
        return this.profileService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.profileService.findOne({ where: { id }, relations: ['user'] });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProfileDto: CreateProfileRequest) {
        return this.profileService.create(createProfileDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileRequest) {
        return this.profileService.update(id, updateProfileDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.profileService.remove(id);
    }
}
