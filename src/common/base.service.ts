import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AuthenticatedUser } from './types';
import { RequestContextService } from './services/request-context/request-context.service';

export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(
    protected readonly requestContextService: RequestContextService,
    protected readonly configService: ConfigService,
    protected readonly datasource: DataSource,
    className?: string,
  ) {
    this.logger = new Logger(className || this.constructor.name);
  }

  get authenticatedUser(): AuthenticatedUser {
    return this.requestContextService.get()?.user;
  }
}
