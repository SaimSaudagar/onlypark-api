import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InfringementController } from "./infringement.controller";
import { InfringementService } from "./infringement.service";
import { Infringement } from "./entities/infringement.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Infringement])],
  controllers: [InfringementController],
  providers: [InfringementService],
  exports: [InfringementService],
})
export class InfringementModule {}
