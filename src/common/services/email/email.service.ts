import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TemplateEngineService } from '../template-engine/template-engine.service';
import { TemplateKeys } from '../../constants/template-keys';
import { MailgunService } from './mailgun.service';

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
  senderName?: string;
  attachments?: any[]; // For Mailgun, this would be an array of { filename: string, content: string }
}

export interface SendEmailResponse {
  sent: boolean;
  errorMessage?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly templateEngine: TemplateEngineService,
    private readonly mailgunService: MailgunService,
  ) { }

  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const { to, subject, body, from, senderName, attachments } = request;

      // Use Mailgun service to send the actual email
      const result = await this.mailgunService.send({
        to,
        subject,
        body,
        from: from || this.configService.get('EMAIL_FROM'),
        senderName: senderName || 'OnlyPark',
        attachments,
      });

      if (result.sent) {
        this.logger.log(`Email sent successfully to ${to}: ${subject}`);
      } else {
        this.logger.error(`Failed to send email to ${to}: ${result.errorMessage}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return { sent: false, errorMessage: error.message };
    }
  }

  async sendUserRegistrationEmail(
    to: string,
    name: string,
    email: string,
    role: string,
    phoneNumber: string,
    passwordSetupUrl: string,
  ): Promise<SendEmailResponse> {
    try {
      const templateName = TemplateKeys.USER_REGISTRATION;
      const subject = 'Welcome to OnlyPark - Complete Your Registration';

      const body = await this.templateEngine.compileFromFile(templateName, {
        name,
        email,
        role,
        phoneNumber: phoneNumber || 'Not provided',
        passwordSetupUrl,
      });

      return await this.sendEmail({
        to,
        subject,
        body,
        senderName: 'OnlyPark',
      });
    } catch (error) {
      this.logger.error(`Failed to send user registration email: ${error.message}`);
      return { sent: false, errorMessage: error.message };
    }
  }
}
