import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { WhitelistService } from "./whitelist.service";
import {
  CreateSelfServeWhitelistRequest,
  CreateSelfServeWhitelistResponse,
  GetWhitelistByTokenResponse,
} from "./whitelist.dto";
import { OptionalJwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Whitelist")
@Controller({ path: "whitelist", version: "1" })
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Post("self-serve")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalJwtAuthGuard)
  createSelfServeWhitelist(
    @Body() request: CreateSelfServeWhitelistRequest,
  ): Promise<CreateSelfServeWhitelistResponse> {
    return this.whitelistService.createSelfServeWhitelist(request);
  }

  @Get(":token")
  @UseGuards(OptionalJwtAuthGuard)
  getWhitelistByToken(
    @Param("token") token: string,
  ): Promise<GetWhitelistByTokenResponse> {
    return this.whitelistService.getWhitelistByToken(token);
  }
}
