import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateStripeCheckoutRequest {
  @IsString()
  @IsNotEmpty()
  stripeProductId: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  ticketNumber: string;
}

export class CreateStripeCheckoutResponse {
  stripeCheckoutUrl: string;
}

export class StripeWebhookRequest {
  // Raw payload will be handled in the controller
}

export class PaymentSuccessRequest {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  ticketNumber?: string;
}
