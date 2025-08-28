import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const traceId = req['traceId'] || 'unknown';

    // Log request
    this.logger.log(
      `[${traceId}] Incoming ${method} ${originalUrl} from ${ip} - ${userAgent}`,
    );

    // Override res.end to capture response
    const originalEnd = res.end.bind(res);
    (res as any).end = function (chunk: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get('Content-Length') || 0;

      // Log response
      const logMessage = `[${traceId}] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms`;
      
      if (statusCode >= 400) {
        Logger.error(logMessage, HttpLoggingMiddleware.name);
      } else {
        Logger.log(logMessage, HttpLoggingMiddleware.name);
      }

      return originalEnd(chunk, encoding);
    };

    next();
  }
}
