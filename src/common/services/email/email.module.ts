import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailgunService } from './mailgun.service';
import { TemplateEngineModule } from '../template-engine/template-engine.module';

@Module({
  imports: [TemplateEngineModule],
  providers: [EmailService, MailgunService],
  exports: [EmailService],
})
export class EmailModule { }
