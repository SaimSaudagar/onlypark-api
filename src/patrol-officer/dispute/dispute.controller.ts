import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RoleGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PermissionsGuard } from "../../common/guards/permission.guard";
import { UserType } from "../../common/enums";
import { DisputeService } from "./dispute.service";
import {
  FindDisputeRequest,
  UpdateDisputeRequest,
  UpdateDisputeStatusRequest,
} from "./dispute.dto";

@ApiTags("Patrol Officer => Dispute")
@UseGuards(RoleGuard, PermissionsGuard)
@Controller({ path: "patrol-officer/dispute", version: "1" })
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Get()
  @Roles(UserType.PATROL_OFFICER)
  findAll(@Query() request: FindDisputeRequest) {
    return this.disputeService.findAll(request);
  }

  @Get(":id")
  @Roles(UserType.PATROL_OFFICER)
  findById(@Param("id") id: string) {
    return this.disputeService.findById(id);
  }

  @Patch("update/:id")
  @Roles(UserType.PATROL_OFFICER)
  update(@Param("id") id: string, @Body() request: UpdateDisputeRequest) {
    return this.disputeService.update(id, request);
  }

  @Patch("/update-status")
  @Roles(UserType.PATROL_OFFICER)
  updateStatus(@Query() request: UpdateDisputeStatusRequest) {
    return this.disputeService.updateStatus(request);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.PATROL_OFFICER)
  remove(@Param("id") id: string) {
    return this.disputeService.remove(id);
  }
}
