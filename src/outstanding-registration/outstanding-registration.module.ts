import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OutstandingRegistrationController } from "./outstanding-registration.controller";
import { OutstandingRegistrationService } from "./outstanding-registration.service";
import { OutstandingRegistration } from "./entities/outstanding-registration.entity";

@Module({
  imports: [TypeOrmModule.forFeature([OutstandingRegistration])],
  controllers: [OutstandingRegistrationController],
  providers: [OutstandingRegistrationService],
  exports: [OutstandingRegistrationService],
})
export class OutstandingRegistrationModule {}
