import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { RequestContextService } from "../services/request-context/request-context.service";

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggingMiddleware.name);

  constructor(private readonly requestContextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send.bind(res);
    res.send = (chunk: any) => {
      this.logger.log(this.getLogMessage(req, chunk, startTime));
      return originalSend(chunk);
    };
    next();
  }

  private getLogMessage(req: Request, responseBody: any, startTime: number) {
    const responseTime = Date.now() - startTime;
    const { ip, baseUrl, headers, method, originalUrl, body, query, params } =
      req;

    const requestContext = this.requestContextService.get();
    const traceId = requestContext?.traceId || "unknown";

    let responseData = responseBody;
    try {
      // Try to parse as JSON if it's a string
      if (typeof responseBody === "string") {
        responseData = JSON.parse(responseBody);
      }
    } catch (error) {
      // If parsing fails, use the original response body
      responseData = responseBody;
    }

    const messageObj = {
      request: {
        ip,
        baseUrl,
        headers,
        method,
        originalUrl,
        body,
        query,
        params,
      },
      response: responseData,
      responseTime: `${responseTime}ms`,
    };
    const logMessage = `${traceId}: ${JSON.stringify(messageObj)}`;
    return logMessage;
  }
}
