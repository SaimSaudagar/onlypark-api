import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DependencyInjectionKeys } from '../../configs';
import { RequestContextService } from './request-context.service';

@Global()
@Module({
  providers: [
    {
      provide: DependencyInjectionKeys.ASYNC_LOCAL_STORAGE,
      useValue: new AsyncLocalStorage(),
    },
    RequestContextService,
  ],
  exports: [RequestContextService],
})
export class RequestContextModule {}
