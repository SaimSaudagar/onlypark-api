import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DependencyInjectionKeys } from '../../configs';
import { RequestContext } from './request-context.interface';

@Injectable()
export class RequestContextService {
  private readonly KEY: string = 'REQUEST_CONTEXT';
  constructor(
    @Inject(DependencyInjectionKeys.ASYNC_LOCAL_STORAGE)
    private readonly asyncLocalStorage: AsyncLocalStorage<Map<string, any>>,
  ) {}

  run(callback: () => void, initialValue: Map<string, any> = new Map()) {
    initialValue.set(this.KEY, {});
    this.asyncLocalStorage.run(initialValue, callback);
  }

  get(): RequestContext {
    const store = this.asyncLocalStorage.getStore();
    if (!store) {
      throw new Error('No store available');
    }
    return store.get(this.KEY);
  }

  set(request: RequestContext) {
    const store = this.asyncLocalStorage.getStore();
    if (!store) {
      throw new Error('No store available');
    }
    store.set(this.KEY, request);
  }
}
