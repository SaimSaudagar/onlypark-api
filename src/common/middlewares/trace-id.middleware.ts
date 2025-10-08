import { Injectable, NestMiddleware } from "@nestjs/common";
import { Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    // Generate unique trace ID for this request
    const traceId = uuidv4();

    // Add trace ID to request object
    req.traceId = traceId;

    // Add trace ID to response headers
    res.setHeader("X-Trace-ID", traceId);

    next();
  }
}
