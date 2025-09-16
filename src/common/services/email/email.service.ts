import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TemplateEngineService } from '../template-engine/template-engine.service';
import { TemplateKeys } from '../../constants/template-keys';
import { MailgunService } from './mailgun.service';
import { CustomException } from '../../exceptions/custom.exception';
import { ErrorCode } from '../../exceptions/error-code';
import { IEmailService } from './email.interface';
import { SendEmailRequest, SendEmailResponse } from './email-notification.dto';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly templateEngine: TemplateEngineService,
    private readonly mailgunService: MailgunService,
  ) { }

  async send(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const { to, subject, body, from, senderName, attachments } = request;

      // Convert array to single string for Mailgun compatibility
      const toEmail = Array.isArray(to) ? to[0] : to;

      // Use Mailgun service to send the actual email
      const result = await this.mailgunService.send({
        to: [toEmail],
        subject,
        body,
        from: from || this.configService.get('EMAIL_FROM'),
        senderName: senderName || 'OnlyPark',
        attachments,
      });

      if (result.sent) {
        this.logger.log(`Email sent successfully to ${to}: ${subject}`);
        return result;
      } else {
        this.logger.error(`Failed to send email to ${to}: ${result.errorMessage}`);
        throw new CustomException(
          ErrorCode.EMAIL_SEND_FAILED.key,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { email: to, error: result.errorMessage }
        );
      }
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new CustomException(
        ErrorCode.EMAIL_SEND_FAILED.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { email: request.to, error: error.message }
      );
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

      return await this.send({
        to: [to],
        subject,
        body,
        senderName: 'OnlyPark',
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(`Failed to send user registration email: ${error.message}`);
      throw new CustomException(
        ErrorCode.EMAIL_SEND_FAILED.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { email: to, error: error.message }
      );
    }
  }

  async sendVisitorBookingConfirmationEmail(
    to: string,
    registrationNumber: string,
    carParkName: string,
    carParkCode: string,
    startTime: string,
    endTime: string,
    status: string,
    tenancyName: string,
    bookingUrl: string,
  ): Promise<SendEmailResponse> {
    try {
      const templateName = TemplateKeys.VISITOR_BOOKING_CONFIRMATION;
      const subject = 'Visitor Parking Booking Confirmation - OnlyPark';

      const body = await this.templateEngine.compileFromFile(templateName, {
        registrationNumber,
        carParkName,
        carParkCode,
        startTime,
        endTime,
        status,
        tenancyName: tenancyName || '',
        bookingUrl,
      });

      return await this.send({
        to: [to],
        subject,
        body,
        senderName: 'OnlyPark',
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(`Failed to send visitor booking confirmation email: ${error.message}`);
      throw new CustomException(
        ErrorCode.EMAIL_SEND_FAILED.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { email: to, error: error.message }
      );
    }
  }
}
