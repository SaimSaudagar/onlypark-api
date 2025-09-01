import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { RequestContextService } from '../services/request-context/request-context.service';
import { RequestContext } from '../services/request-context/request-context.interface';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContextService: RequestContextService) { }

  use(req: Request, res: Response, next: NextFunction): void {
    const timestamp = new Date().getTime();
    const randomString = crypto.randomBytes(4).toString('hex');
    const requestContext: RequestContext = {
      traceId: `${timestamp}-${randomString}`,
      auditLogs: [],
    };

    this.requestContextService.run(() => {
      next();
    }, requestContext);
  }
}
