import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from '../services/request-context/request-context.service';
import { RequestContext } from '../services/request-context/request-context.interface';
import { AuthenticatedUser } from '../types';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const contextStore = new Map<string, unknown>();
    this.requestContextService.run(() => {
      // Set user context if available
      if (req.user) {
        const context: RequestContext = {
          user: req.user as AuthenticatedUser,
        };
        this.requestContextService.set(context);
      }
      next();
    }, contextStore);
  }
}
