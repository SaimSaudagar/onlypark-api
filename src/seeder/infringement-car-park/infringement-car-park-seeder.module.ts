import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InfringementCarPark } from "../../infringement/entities/infringement-car-park.entity";
import { InfringementCarParkSeederService } from "./infringement-car-park-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([InfringementCarPark])],
  providers: [InfringementCarParkSeederService],
  exports: [InfringementCarParkSeederService],
})
export class InfringementCarParkSeederModule {}
