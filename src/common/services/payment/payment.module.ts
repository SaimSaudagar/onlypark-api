import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule],
  providers: [PaymentService, StripeService],
  exports: [PaymentService, StripeService],
})
export class PaymentModule {}
