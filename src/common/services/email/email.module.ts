import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { MailgunService } from "./mailgun.service";
import { TemplateEngineModule } from "../template-engine/template-engine.module";
import { DependencyInjectionKeys } from "../../configs";

@Module({
  imports: [TemplateEngineModule],
  providers: [
    EmailService,
    MailgunService,
    {
      provide: DependencyInjectionKeys.EMAIL,
      useClass: EmailService,
    },
  ],
  exports: [EmailService, DependencyInjectionKeys.EMAIL],
})
export class EmailModule {}
