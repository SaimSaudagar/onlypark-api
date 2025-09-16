import { Module } from '@nestjs/common';
import { TemplateEngineService } from './template-engine.service';
import { DependencyInjectionKeys } from '../../configs';

@Module({
    providers: [
        TemplateEngineService,
        {
            provide: DependencyInjectionKeys.TEMPLATE_ENGINE,
            useClass: TemplateEngineService,
        },
    ],
    exports: [TemplateEngineService, DependencyInjectionKeys.TEMPLATE_ENGINE],
})
export class TemplateEngineModule { }
