import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigKeys, DependencyInjectionKeys } from "../../configs";
import { IEmailService } from "./email.interface";
import { ITemplateStorage } from "../../../notification/template-storage/template-storage.interface";
import { ITemplateEngine } from "../template-engine/template-engine.service";
import {
  EmailTemplateParams,
  SendEmailRequest,
  SendEmailResponse,
  SendEmailUsingTemplateRequest,
  SendEmailUsingTemplateResponse,
} from "./email-notification.dto";

@Injectable()
export class EmailNotificationService {
  private readonly defaultSenderName: string;
  private readonly defaultFrom: string;
  private readonly emailTemplateParams: EmailTemplateParams;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DependencyInjectionKeys.EMAIL)
    private readonly emailService: IEmailService,
    @Inject(DependencyInjectionKeys.TEMPLATE_STORAGE)
    private readonly templateStorageService: ITemplateStorage,
    @Inject(DependencyInjectionKeys.TEMPLATE_ENGINE)
    private readonly templateEngine: ITemplateEngine,
  ) {
    this.defaultSenderName = this.configService.get(
      ConfigKeys.EMAIL_SENDER_NAME,
    );
    this.defaultFrom = this.configService.get(ConfigKeys.EMAIL_FROM);
    this.emailTemplateParams = JSON.parse(
      this.configService.get(ConfigKeys.EMAIL_TEMPLATE_PARAMS),
    );
  }

  async send(request: SendEmailRequest): Promise<SendEmailResponse> {
    return await this.emailService.send(request);
  }

  async sendUsingTemplate<T>(
    request: SendEmailUsingTemplateRequest<T>,
  ): Promise<SendEmailUsingTemplateResponse> {
    try {
      const template = await this.templateStorageService.get(
        request.templateKey,
      );

      if (!template) {
        throw new Error(`Template not found: ${request.templateKey}`);
      }

      if (!template.titleTemplate) {
        throw new Error(
          `Template missing titleTemplate: ${request.templateKey}`,
        );
      }

      if (!template.bodyTemplate) {
        throw new Error(
          `Template missing bodyTemplate: ${request.templateKey}`,
        );
      }

      const titleTemplate = await this.templateEngine.compile(
        template.titleTemplate,
        request.data,
      );
      const bodyTemplate = await this.templateEngine.compile(
        template.bodyTemplate,
        { ...request.data, ...this.emailTemplateParams, title: titleTemplate },
      );

      let finalTemplate = bodyTemplate;

      if (template.layout) {
        const templateLayout = await this.templateStorageService.get(
          template.layout,
        );

        if (!templateLayout) {
          throw new Error(`Layout template not found: ${template.layout}`);
        }

        if (!templateLayout.bodyTemplate) {
          throw new Error(
            `Layout template missing bodyTemplate: ${template.layout}`,
          );
        }

        finalTemplate = await this.templateEngine.compile(
          templateLayout.bodyTemplate,
          {
            title: titleTemplate,
            ...request.data,
            ...this.emailTemplateParams,
            body: bodyTemplate,
            currentYear: new Date().getFullYear().toString(),
          },
        );
      }

      const result = await this.emailService.send({
        senderName: request.senderName || this.defaultSenderName,
        from: request.from || this.defaultFrom,
        subject: titleTemplate,
        to: request.to,
        body: finalTemplate,
        attachments: request.attachments,
      });

      if (!result.sent) {
        throw new Error(`Email sending failed: ${result.errorMessage}`);
      }

      return result;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }
}
