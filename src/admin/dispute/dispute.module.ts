import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DisputeController } from "./dispute.controller";
import { DisputeService } from "./dispute.service";
import { Dispute } from "../../dispute/entities/dispute.entity";
import { CarMakeModule } from "../../car-make/car-make.module";
import { InfringementModule } from "../infringement/infringement.module";
import { EmailNotificationModule } from "../../common/services/email/email-notification.module";
import { FileUploadModule } from "../../common/services/file-upload/file-upload.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute]),
    InfringementModule,
    CarMakeModule,
    EmailNotificationModule,
    FileUploadModule,
  ],
  controllers: [DisputeController],
  providers: [DisputeService],
  exports: [DisputeService],
})
export class DisputeModule {}
