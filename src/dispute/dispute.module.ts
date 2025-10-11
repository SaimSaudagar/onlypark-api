import { Module } from "@nestjs/common";
import { InfringementModule } from "../admin/infringement/infringement.module";
import { DisputeController } from "./dispute.controller";
import { DisputeService } from "./dispute.service";
import { Dispute } from "./entities/dispute.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailNotificationModule } from "../common/services/email/email-notification.module";
import { FileUploadModule } from "../common/services/file-upload/file-upload.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute]),
    InfringementModule,
    EmailNotificationModule,
    FileUploadModule,
  ],
  controllers: [DisputeController],
  providers: [DisputeService],
})
export class DisputeModule {}
