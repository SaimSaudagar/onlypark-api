import { Inject, Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";
import { DependencyInjectionKeys } from "../../configs";
import { RequestContext } from "./request-context.interface";

@Injectable()
export class RequestContextService {
  private readonly KEY: symbol = Symbol("REQUEST_CONTEXT");
  constructor(
    @Inject(DependencyInjectionKeys.ASYNC_LOCAL_STORAGE)
    private readonly asyncLocalStorage: AsyncLocalStorage<Map<symbol, any>>,
  ) {}

  run(callback: () => void, initialValue: RequestContext = {}) {
    const store = new Map<symbol, any>();
    store.set(this.KEY, initialValue);
    this.asyncLocalStorage.run(store, () => {
      callback();
    });
  }

  get(): RequestContext {
    const store = this.asyncLocalStorage.getStore();
    // if (!store) {
    //   throw new Error('No store available');
    // }
    const context = store?.get(this.KEY);
    return context || {};
  }

  set(request: RequestContext) {
    const store = this.asyncLocalStorage.getStore();
    // if (!store) {
    //   throw new Error('No store available');
    // }
    store?.set(this.KEY, request);
  }
}
