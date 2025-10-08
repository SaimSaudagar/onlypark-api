import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarMakeController } from "./car-make.controller";
import { CarMakeService } from "./car-make.service";
import { CarMake } from "./entities/car-make.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CarMake])],
  controllers: [CarMakeController],
  providers: [CarMakeService],
  exports: [CarMakeService],
})
export class CarMakeModule {}
