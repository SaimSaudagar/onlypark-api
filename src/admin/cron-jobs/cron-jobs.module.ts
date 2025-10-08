import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CronJobsService } from "./cron-jobs.service";
import { Infringement } from "../../infringement/entities/infringement.entity";
import { VisitorBooking } from "../../visitor-booking/entities/visitor-booking.entity";
import { OutstandingRegistration } from "../../outstanding-registration/entities/outstanding-registration.entity";
import { EmailNotificationModule } from "../../common/services/email/email-notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Infringement,
      VisitorBooking,
      OutstandingRegistration,
    ]),
    EmailNotificationModule,
  ],
  providers: [CronJobsService],
  exports: [CronJobsService],
})
export class CronJobsModule {}
