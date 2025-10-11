import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { ApiTags, ApiConsumes } from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { DisputeService } from "./dispute.service";
import { CreateDisputeRequest, CreateDisputeResponse } from "./dispute.dto";

@ApiTags("Dispute")
@Controller({ path: "dispute", version: "1" })
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor("photos", 10)) // Allow up to 10 photos
  @ApiConsumes("multipart/form-data")
  create(
    @Body() request: CreateDisputeRequest,
    @UploadedFiles() photos?: Express.Multer.File[]
  ): Promise<CreateDisputeResponse> {
    return this.disputeService.create(request, photos);
  }
}
