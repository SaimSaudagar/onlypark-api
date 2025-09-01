import { Module } from '@nestjs/common';
import { TemplateEngineService } from './template-engine.service';

@Module({
    providers: [TemplateEngineService],
    exports: [TemplateEngineService],
})
export class TemplateEngineModule { }
