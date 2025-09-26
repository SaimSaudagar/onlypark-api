import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";
import { InfringementModule } from "../../../infringement/infringement.module";

@Module({
  imports: [ConfigModule, InfringementModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
