import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InfringementReason } from "../../infringement/entities/infringement-reason.entity";
import { InfringementReasonSeederService } from "./infringement-reason-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([InfringementReason])],
  providers: [InfringementReasonSeederService],
  exports: [InfringementReasonSeederService],
})
export class InfringementReasonSeederModule {}
