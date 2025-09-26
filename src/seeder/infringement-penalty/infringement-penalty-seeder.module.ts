import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InfringementPenalty } from "../../infringement/entities/infringement-penalty.entity";
import { InfringementCarPark } from "../../infringement/entities/infringement-car-park.entity";
import { InfringementPenaltySeederService } from "./infringement-penalty-seeder.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([InfringementPenalty, InfringementCarPark]),
  ],
  providers: [InfringementPenaltySeederService],
  exports: [InfringementPenaltySeederService],
})
export class InfringementPenaltySeederModule {}
