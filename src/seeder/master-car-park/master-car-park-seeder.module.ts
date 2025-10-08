import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MasterCarPark } from "../../master-car-park/entities/master-car-park.entity";
import { MasterCarParkSeederService } from "./master-car-park-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([MasterCarPark])],
  providers: [MasterCarParkSeederService],
  exports: [MasterCarParkSeederService],
})
export class MasterCarParkSeederModule {}
