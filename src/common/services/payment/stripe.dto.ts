import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateStripeCheckoutRequest {
  @IsString()
  @IsNotEmpty()
  stripe_product_id: string;

  @IsString()
  @IsNotEmpty()
  reg_no: string;

  @IsString()
  @IsNotEmpty()
  ticket_number: string;

  @IsOptional()
  @IsString()
  car_make?: string;
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
  session_id?: string;

  @IsOptional()
  @IsString()
  reg_no?: string;

  @IsOptional()
  @IsString()
  ticket_number?: string;
}
