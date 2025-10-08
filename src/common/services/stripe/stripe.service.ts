import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { CustomException } from "../../exceptions/custom.exception";
import { ErrorCode } from "../../exceptions/error-code";
import { HttpStatus } from "@nestjs/common";
import { ConfigKeys } from "../../configs";

export interface StripeCheckoutMetadata {
  registrationNumber: string;
  ticketNumber: string;
  carMake: string;
}

export interface StripeCheckoutRequest {
  stripePriceId: string;
  registrationNumber: string;
  ticketNumber: string;
  carMake: string;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>(
      ConfigKeys.STRIPE_SECRET_KEY,
    );
    if (!secretKey) {
      throw new Error("STRIPE_SECRET is not configured");
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }

  async createCheckoutSession(
    request: StripeCheckoutRequest,
  ): Promise<StripeCheckoutResponse> {
    try {
      this.logger.log("Creating Stripe checkout session", { request });
      console.log(
        "cehclllllll",
        this.configService.get<string>(ConfigKeys.STRIPE_SECRET_KEY),
      );
      // Retrieve the price to determine if it's one-time or subscription
      const price = await this.stripe.prices.retrieve(request.stripePriceId);

      console.log("price", price);

      const metadata: Record<string, string> = {
        reg_no: request.registrationNumber,
        ticket_number: request.ticketNumber,
        car_make: request.carMake,
      };

      console.log("metadata", metadata);

      const sessionData: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price: request.stripePriceId,
            quantity: 1,
          },
        ],
        mode: price.type === "one_time" ? "payment" : "subscription",
        customer_creation: "always",
        allow_promotion_codes: true,
        phone_number_collection: { enabled: true },
        success_url: `${request.successUrl}?session_id={CHECKOUT_SESSION_ID}&reg_no=${request.registrationNumber}&ticket_number=${request.ticketNumber}`,
        cancel_url: request.cancelUrl,
        metadata,
      };

      if (price.type === "one_time") {
        sessionData.payment_intent_data = {
          metadata,
          description: `Infringement Payment - Ticket #${request.ticketNumber} for vehicle ${request.registrationNumber}`,
        };
      } else {
        sessionData.subscription_data = {
          metadata,
          description: `Infringement Payment - Ticket #${request.ticketNumber} for vehicle ${request.registrationNumber}`,
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionData);

      this.logger.log("Stripe checkout session created successfully", {
        sessionId: session.id,
        url: session.url,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error("Error creating Stripe checkout session", error);
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { error: error.message },
      );
    }
  }

  async constructWebhookEvent(
    payload: string,
    signature: string,
  ): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.configService.get<string>(
        ConfigKeys.STRIPE_WEBHOOK_SECRET,
      );
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
      }

      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error("Error constructing webhook event", error);
      throw new CustomException(
        ErrorCode.CLIENT_ERROR.key,
        HttpStatus.BAD_REQUEST,
        { error: "Invalid webhook signature" },
      );
    }
  }

  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      this.logger.error("Error retrieving checkout session", error);
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { error: error.message },
      );
    }
  }

  async retrieveSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error("Error retrieving subscription", error);
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { error: error.message },
      );
    }
  }

  extractMetadataFromSession(
    session: Stripe.Checkout.Session,
  ): StripeCheckoutMetadata | null {
    if (!session.metadata) {
      return null;
    }

    const { reg_no, ticket_number, car_make } = session.metadata;
    if (!reg_no || !ticket_number) {
      return null;
    }

    return {
      registrationNumber: reg_no,
      ticketNumber: ticket_number,
      carMake: car_make || "",
    };
  }

  extractMetadataFromPaymentIntent(
    paymentIntent: Stripe.PaymentIntent,
  ): StripeCheckoutMetadata | null {
    if (!paymentIntent.metadata) {
      return null;
    }

    const { reg_no, ticket_number, car_make } = paymentIntent.metadata;
    if (!reg_no || !ticket_number) {
      return null;
    }

    return {
      registrationNumber: reg_no,
      ticketNumber: ticket_number,
      carMake: car_make || "",
    };
  }

  extractMetadataFromSubscription(
    subscription: Stripe.Subscription,
  ): StripeCheckoutMetadata | null {
    if (!subscription.metadata) {
      return null;
    }

    const { reg_no, ticket_number, car_make } = subscription.metadata;
    if (!reg_no || !ticket_number) {
      return null;
    }

    return {
      registrationNumber: reg_no,
      ticketNumber: ticket_number,
      carMake: car_make || "",
    };
  }
}
