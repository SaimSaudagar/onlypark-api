import { Module } from "@nestjs/common";
import { FileStorageModule } from "./file/file-storage.module";
import { FileStorageService } from "./file/file-storage.service";
import { DependencyInjectionKeys } from "../../common/configs";

@Module({
  imports: [FileStorageModule],
  providers: [
    {
      provide: DependencyInjectionKeys.TEMPLATE_STORAGE,
      useClass: FileStorageService,
    },
  ],
  exports: [FileStorageModule, DependencyInjectionKeys.TEMPLATE_STORAGE],
})
export class TemplateStorageModule {
  static register() {
    return {
      module: TemplateStorageModule,
      imports: [FileStorageModule],
      providers: [
        {
          provide: DependencyInjectionKeys.TEMPLATE_STORAGE,
          useClass: FileStorageService,
        },
      ],
      exports: [FileStorageModule, DependencyInjectionKeys.TEMPLATE_STORAGE],
    };
  }
}
