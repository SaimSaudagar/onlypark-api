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
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProfileService } from "./profile.service";

@ApiTags("Patrol Officer => Profile")
@Controller({ path: "patrol-officer/profile", version: "1" })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.profileService.findOne({ where: { id } });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: any) {
    return this.profileService.create(createDto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: any) {
    return this.profileService.update(id, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.profileService.remove(id);
  }
}
