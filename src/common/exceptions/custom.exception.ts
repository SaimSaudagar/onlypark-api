import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code';

export class CustomException extends HttpException {
  readonly code: string;
  readonly data: object;
  constructor(
    key: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    data?: object,
  ) {
    const errorCode = ErrorCode.getCode(key);
    super(ErrorCode.getMessage(key), statusCode);
    this.code = errorCode;
    this.data = data;
  }
}

export class NestCustomException extends HttpException {
  readonly code: string;
  readonly data: object;
  constructor(key: string, data: object, message?: string) {
    const errorCode = ErrorCode.getCode(key);
    let errorMessage;
    if (key == ErrorCode.NOT_SPECIFIED.key) {
      errorMessage = message;
    } else {
      errorMessage = ErrorCode.getMessage(key);
    }
    super(errorMessage, HttpStatus.BAD_REQUEST);
    this.code = errorCode;
    this.data = data;
  }
}
