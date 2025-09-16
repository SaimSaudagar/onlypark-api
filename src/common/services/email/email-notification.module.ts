import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service';
import { EmailModule } from './email.module';
import { TemplateEngineModule } from '../template-engine/template-engine.module';
import { TemplateStorageModule } from '../../../notification/template-storage/template-storage.module';

@Module({
    imports: [EmailModule, TemplateEngineModule, TemplateStorageModule],
    providers: [EmailNotificationService],
    exports: [EmailNotificationService],
})
export class EmailNotificationModule { }
