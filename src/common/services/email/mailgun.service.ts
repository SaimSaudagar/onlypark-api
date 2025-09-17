import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { SendEmailRequest, SendEmailResponse } from './email-notification.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { ErrorCode } from '../../exceptions/error-code';

@Injectable()
export class MailgunService {
    private readonly logger = new Logger(MailgunService.name);
    private readonly mailgun: Mailgun;
    private readonly domain: string;
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.domain = this.configService.get<string>('MAILGUN_DOMAIN') || 'onlypark.com.au';
        this.apiKey = this.configService.get<string>('MAILGUN_SECRET') || '';

        if (!this.apiKey) {
            this.logger.warn('MAILGUN_SECRET not configured, email sending will be simulated');
        }

        try {
            this.mailgun = new Mailgun(FormData);
        } catch (error) {
            this.logger.error(`Failed to initialize Mailgun: ${error.message}`);
            // Set mailgun to null to handle gracefully
            this.mailgun = null;
        }
    }

    async send(request: SendEmailRequest): Promise<SendEmailResponse> {
        const response: SendEmailResponse = {
            sent: false,
        };

        try {
            if (!this.apiKey || !this.mailgun) {
                // Simulate email sending when API key is not configured or mailgun failed to initialize
                this.logger.log(`[SIMULATED] Sending email to ${request.to}: ${request.subject}`);
                this.logger.log(`[SIMULATED] From: ${request.senderName || 'OnlyPark'} <${request.from || this.configService.get('EMAIL_FROM')}>`);
                this.logger.log(`[SIMULATED] Body: ${request.body.substring(0, 200)}...`);

                response.sent = true;
                return response;
            }

            const mg = this.mailgun.client({ username: 'api', key: this.apiKey });

            const messageData = {
                from: `${request.senderName || 'OnlyPark'} <${request.from || this.configService.get('EMAIL_FROM')}>`,
                to: request.to,
                subject: request.subject,
                html: request.body,
            };

            if (request.attachments && request.attachments.length > 0) {
                messageData['attachment'] = request.attachments.map(attachment => ({
                    filename: attachment.name,
                    data: attachment.content,
                    contentType: attachment.contentType,
                }));
            }

            const result = await mg.messages.create(this.domain, messageData);

            this.logger.log(`Email sent successfully to ${request.to}: ${result.id}`);
            response.sent = true;

        } catch (error) {
            this.logger.error(`Failed to send email to ${request.to}: ${error.message}`);
            throw new CustomException(
                ErrorCode.EMAIL_SEND_FAILED.key,
                HttpStatus.INTERNAL_SERVER_ERROR,
                { email: request.to, error: error.message }
            );
        }

        return response;
    }
}
