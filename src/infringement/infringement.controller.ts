import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InfringementService } from "./infringement.service";
import {
  GetInfringementPaymentRequest,
  GetInfringementPaymentResponse,
} from "./infringement.dto";

@ApiTags("Infringement")
@Controller({ path: "infringement", version: "1" })
export class InfringementController {
  constructor(private readonly infringementService: InfringementService) {}

  @Get("ticket-details")
  getTicketDetails(
    @Query() request: GetInfringementPaymentRequest
  ): Promise<GetInfringementPaymentResponse> {
    return this.infringementService.getInfringementPayment(request);
  }
}
