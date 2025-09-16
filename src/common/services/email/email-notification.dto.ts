export class SendEmailRequest {
    senderName?: string;
    from?: string;
    to: string[];
    subject: string;
    body: string;
    attachments?: Array<{
        name: string;
        content: string;
        contentType: string;
    }>;
}

export class SendEmailResponse {
    sent: boolean;
    errorMessage?: string;
}

export class SendEmailUsingTemplateRequest<T> {
    senderName?: string;
    from?: string;
    to: string[];
    templateKey: string;
    data: {
        [K in keyof T]: string;
    };
    attachments?: Array<{
        name: string;
        content: string;
        contentType: string;
    }>;
}

export class SendEmailUsingTemplateResponse extends SendEmailResponse { }

export class EmailTemplateParams {
    name: string;
    senderName: string;
    supportEmail: string;
    senderEmail: string;
    facebookUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    linkedinUrl: string;
    websiteUrl: string;
    privacyPolicy: string;
    termsAndConditions: string;
    manageSubscription: string;
    unsubscribe: string;
    loginUrl: string;
    helpUrl: string;
}
