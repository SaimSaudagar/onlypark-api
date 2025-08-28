import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  readonly code: string;

  constructor(key: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(key, statusCode);
    this.code = key;
  }
}

export class NestCustomException extends HttpException {
  readonly code: string;
  readonly propertyName: string;

  constructor(key: string, propertyName: string, message: string) {
    super(message, HttpStatus.BAD_REQUEST);
    this.code = key;
    this.propertyName = propertyName;
  }
}

export class BusinessLogicException extends HttpException {
  readonly code: string;
  readonly context?: any;

  constructor(
    message: string,
    code: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    context?: any,
  ) {
    super(message, statusCode);
    this.code = code;
    this.context = context;
  }
}

export class ValidationException extends HttpException {
  readonly code: string;
  readonly validationErrors: any[];

  constructor(
    message: string,
    validationErrors: any[],
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
    this.code = 'VALIDATION_ERROR';
    this.validationErrors = validationErrors;
  }
}

export class GeolocationException extends HttpException {
  readonly code: string;
  readonly distance?: number;
  readonly allowedRadius?: number;

  constructor(
    message: string,
    distance?: number,
    allowedRadius?: number,
    statusCode: HttpStatus = HttpStatus.FORBIDDEN,
  ) {
    super(message, statusCode);
    this.code = 'GEOLOCATION_ERROR';
    this.distance = distance;
    this.allowedRadius = allowedRadius;
  }
}

export class PaymentException extends HttpException {
  readonly code: string;
  readonly paymentError?: any;

  constructor(
    message: string,
    paymentError?: any,
    statusCode: HttpStatus = HttpStatus.PAYMENT_REQUIRED,
  ) {
    super(message, statusCode);
    this.code = 'PAYMENT_ERROR';
    this.paymentError = paymentError;
  }
}

export class BookingException extends HttpException {
  readonly code: string;
  readonly bookingId?: string;
  readonly conflictDetails?: any;

  constructor(
    message: string,
    bookingId?: string,
    conflictDetails?: any,
    statusCode: HttpStatus = HttpStatus.CONFLICT,
  ) {
    super(message, statusCode);
    this.code = 'BOOKING_ERROR';
    this.bookingId = bookingId;
    this.conflictDetails = conflictDetails;
  }
}

export class InfringementException extends HttpException {
  readonly code: string;
  readonly ticketNumber?: string;

  constructor(
    message: string,
    ticketNumber?: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
    this.code = 'INFRINGEMENT_ERROR';
    this.ticketNumber = ticketNumber;
  }
}
