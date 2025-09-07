import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import * as handlebars from 'handlebars';
import { ApiResponse } from '../types';
import { ErrorCode } from './error-code';
import { CustomException, NestCustomException } from './custom.exception';
import { RequestContextService } from '../services/request-context/request-context.service';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  constructor(
    private readonly httpAdapterrHost: HttpAdapterHost,
    private readonly requestContextService: RequestContextService,
  ) { }

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const traceId = this.requestContextService.get()?.traceId;
    let exceptionMessage = `${traceId}: `;
    if (typeof exception === 'object') {
      exceptionMessage += JSON.stringify(exception);
    } else exceptionMessage += String(exception);

    const errorDetail = await this.getExceptionDetails(exception);
    if (errorDetail.statusCode >= 500 && exception['stack']) {
      const stack = `${traceId}: ${exception['stack']}`;
      Sentry.captureException(exception);
      this.logger.error(exceptionMessage, stack);
    }

    const responsePayload: ApiResponse<null> = {
      statusCode: errorDetail.statusCode,
      data: null,
      error: {
        code: errorDetail.code,
        message: errorDetail.message,
        timestamp: new Date().toISOString(),
      },
    };

    const { httpAdapter } = this.httpAdapterrHost;
    httpAdapter.reply(
      ctx.getResponse(),
      responsePayload,
      errorDetail.statusCode,
    );
  }

  private async getExceptionDetails(
    exception: unknown,
  ): Promise<{
    statusCode: number;
    code: string;
    message: string;
  }> {
    const result = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.SERVER_ERROR.code,
      message: ErrorCode.SERVER_ERROR.message,
    };

    if (
      exception instanceof CustomException ||
      exception instanceof NestCustomException
    ) {
      result.statusCode = exception.getStatus();
      result.code = exception.code;
      result.message = exception.message;

      if (exception.data && Object.keys(exception.data).length > 0) {
        const compiledTemplate = handlebars.compile(result.message);
        result.message = compiledTemplate(exception.data);
      }
    } else if (exception instanceof HttpException) {
      result.statusCode = exception.getStatus();
      result.code = null;
      result.message = exception.message;
    }

    return result;
  }
}
