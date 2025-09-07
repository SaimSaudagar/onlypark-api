import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CarMake } from './entities/car-make.entity';
import {
  CreateCarMakeRequest,
  UpdateCarMakeRequest,
} from './car-make.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class CarMakeService {
  constructor(
    @InjectRepository(CarMake)
    private carMakeRepository: Repository<CarMake>,
  ) { }

  async create(request: CreateCarMakeRequest): Promise<CarMake> {
    const { carMakeName } = request;

    // check if the car make exists in the db
    const carMakeInDb = await this.carMakeRepository.findOne({
      where: { carMakeName: carMakeName },
    });
    if (carMakeInDb) {
      throw new CustomException(
        ErrorCode.CAR_MAKE_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const carMake = this.carMakeRepository.create({
          carMakeName: carMakeName,
    });
    return await this.carMakeRepository.save(carMake);
  }

  async findAll(options?: FindManyOptions<CarMake>): Promise<CarMake[]> {
    return await this.carMakeRepository.find(options);
  }

  async findOne(options?: FindOneOptions<CarMake>): Promise<CarMake> {
    const carMake = await this.carMakeRepository.findOne(options);
    return carMake;
  }

  async update(id: string, updateCarMakeDto: UpdateCarMakeRequest) {
    const carMake = await this.carMakeRepository.findOne({ where: { id } });
    if (!carMake) {
      throw new CustomException(
        ErrorCode.CAR_MAKE_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    Object.assign(carMake, updateCarMakeDto);
    return await this.carMakeRepository.save(carMake);
  }

  remove(id: string) {
    return `This action removes a #${id} car make`;
  }
}
