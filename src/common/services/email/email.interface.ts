import { SendEmailRequest, SendEmailResponse } from './email-notification.dto';

export abstract class IEmailService {
    abstract send(request: SendEmailRequest): Promise<SendEmailResponse>;
}
