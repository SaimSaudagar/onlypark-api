import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  Res,
  Get,
  Query,
  Logger,
  HttpStatus,
  HttpCode,
  RawBodyRequest,
} from "@nestjs/common";
import { Request, Response } from "express";
import { StripeService, StripeCheckoutMetadata } from "./stripe.service";
import { InfringementService } from "../../../infringement/infringement.service";
import { CustomException } from "../../exceptions/custom.exception";
import { ErrorCode } from "../../exceptions/error-code";
import {
  CreateStripeCheckoutRequest,
  CreateStripeCheckoutResponse,
  PaymentSuccessRequest,
} from "./stripe.dto";
import { InfringementStatus } from "../../enums";
import { ApiTags } from "@nestjs/swagger";

@Controller("stripe")
@ApiTags("Stripe")
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly infringementService: InfringementService
  ) {}

  @Post("checkout")
  async createCheckout(
    @Body() request: CreateStripeCheckoutRequest
  ): Promise<CreateStripeCheckoutResponse> {
    try {
      this.logger.log("Stripe checkout request received", { request });

      // Find the infringement
      const infringement =
        await this.infringementService.findInfringementForPayment(
          request.reg_no,
          parseInt(request.ticket_number)
        );

      if (!infringement) {
        throw new CustomException(
          ErrorCode.INFRINGEMENT_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST
        );
      }

      if (infringement.status === InfringementStatus.PAID) {
        throw new CustomException(
          ErrorCode.CLIENT_ERROR.key,
          HttpStatus.BAD_REQUEST,
          { error: "Infringement already paid" }
        );
      }

      // Determine the correct price ID based on due date
      const today = new Date();
      const dueDate = new Date(infringement.dueDate);
      const isOverdue = today > dueDate;

      let stripePriceId = isOverdue
        ? infringement.penalty?.stripePriceIdAfterDue
        : infringement.penalty?.stripePriceIdBeforeDue;

      // If stripe_product_id is provided in request, use it (for manual overrides)
      if (request.stripe_product_id) {
        stripePriceId = request.stripe_product_id;
      }

      if (!stripePriceId) {
        throw new CustomException(
          ErrorCode.SERVER_ERROR.key,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { error: "Stripe price ID not configured for this penalty" }
        );
      }

      // Get frontend URL with fallback
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
      this.logger.log(`Using frontend URL: ${frontendUrl}`);

      // Create checkout session
      const checkoutResponse = await this.stripeService.createCheckoutSession({
        stripePriceId,
        registrationNo: request.reg_no,
        ticketNumber: request.ticket_number,
        carMake: request.car_make || infringement.carMake?.carMakeName || "",
        successUrl: `${frontendUrl}/payment/success`,
        cancelUrl: `${frontendUrl}/payment/cancel`,
      });

      return {
        stripeCheckoutUrl: checkoutResponse.checkoutUrl,
      };
    } catch (error) {
      this.logger.error("Error creating checkout session", error);

      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { error: "An unexpected error occurred. Please try again." }
      );
    }
  }

  @Get("success")
  async paymentSuccess(
    @Query() query: PaymentSuccessRequest,
    @Res() res: Response
  ) {
    try {
      const { session_id, reg_no, ticket_number } = query;

      this.logger.log("Payment success page accessed", {
        sessionId: session_id,
        regNo: reg_no,
        ticketNumber: ticket_number,
      });

      // Redirect to frontend success page with parameters
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const redirectUrl = `${frontendUrl}/customer/noncompliance-payment-form?success=true&reg_no=${reg_no}&ticket_number=${ticket_number}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error("Error in payment success handler", error);

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const redirectUrl = `${frontendUrl}/payment/cancel?error=true`;

      return res.redirect(redirectUrl);
    }
  }

  @Get("cancel")
  async paymentCancel(@Res() res: Response) {
    try {
      this.logger.log("Payment cancelled");

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const redirectUrl = `${frontendUrl}/payment/cancel`;

      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error("Error in payment cancel handler", error);

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/payment/cancel?error=true`);
    }
  }

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string
  ) {
    try {
      const payload = req.rawBody.toString();

      this.logger.log("Stripe webhook received", {
        signature: signature?.substring(0, 20) + "...",
        payloadLength: payload.length,
      });

      // Construct the webhook event
      const event = await this.stripeService.constructWebhookEvent(
        payload,
        signature
      );

      this.logger.log("Webhook event verified", {
        type: event.type,
        id: event.id,
      });

      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object as any);
          break;
        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(event.data.object as any);
          break;
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event.data.object as any);
          break;
        default:
          this.logger.log("Unhandled event type", { type: event.type });
      }

      return { received: true };
    } catch (error) {
      this.logger.error("Webhook error", error);

      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { error: "Webhook processing failed" }
      );
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    this.logger.log("Processing checkout.session.completed", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      mode: session.mode,
    });

    // Only process if payment is actually successful
    if (session.payment_status !== "paid") {
      this.logger.warn("Session payment not completed", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
      return;
    }

    const metadata = this.stripeService.extractMetadataFromSession(session);
    if (!metadata) {
      this.logger.error("Missing metadata in session", {
        sessionId: session.id,
        metadata: session.metadata,
      });
      return;
    }

    await this.updateInfringementStatus(metadata, session.id);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    this.logger.log("Processing payment_intent.succeeded", {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    const metadata =
      this.stripeService.extractMetadataFromPaymentIntent(paymentIntent);
    if (!metadata) {
      this.logger.error("Missing metadata in payment intent", {
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata,
      });
      return;
    }

    await this.updateInfringementStatus(metadata, paymentIntent.id);
  }

  private async handleInvoicePaymentSucceeded(invoice: any) {
    this.logger.log("Processing invoice.payment_succeeded", {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
    });

    if (invoice.subscription) {
      try {
        const subscription = await this.stripeService.retrieveSubscription(
          invoice.subscription
        );

        const metadata =
          this.stripeService.extractMetadataFromSubscription(subscription);
        if (!metadata) {
          this.logger.error("Missing metadata in subscription", {
            subscriptionId: subscription.id,
            metadata: subscription.metadata,
          });
          return;
        }

        await this.updateInfringementStatus(metadata, subscription.id);
      } catch (error) {
        this.logger.error("Error processing subscription payment", error);
      }
    }
  }

  private async updateInfringementStatus(
    metadata: StripeCheckoutMetadata,
    stripeId: string
  ) {
    try {
      // Check if already processed to prevent duplicate updates
      const existingInfringement =
        await this.infringementService.findInfringementForPayment(
          metadata.registrationNo,
          parseInt(metadata.ticketNumber)
        );

      if (!existingInfringement) {
        this.logger.error("Infringement not found for payment update", {
          registrationNo: metadata.registrationNo,
          ticketNumber: metadata.ticketNumber,
        });
        return;
      }

      if (existingInfringement.status === InfringementStatus.PAID) {
        this.logger.log("Infringement already marked as paid", {
          registrationNo: metadata.registrationNo,
          ticketNumber: metadata.ticketNumber,
        });
        return;
      }

      // Update infringement status to paid
      await this.infringementService.updatePaymentStatus(
        metadata.registrationNo,
        parseInt(metadata.ticketNumber),
        InfringementStatus.PAID
      );

      this.logger.log("Successfully updated infringement status to paid", {
        registrationNo: metadata.registrationNo,
        ticketNumber: metadata.ticketNumber,
        stripeId,
      });
    } catch (error) {
      this.logger.error("Error updating infringement status", {
        registrationNo: metadata.registrationNo,
        ticketNumber: metadata.ticketNumber,
        stripeId,
        error: error.message,
      });
    }
  }
}
