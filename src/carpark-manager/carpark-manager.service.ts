import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CarparkManager } from './entities/carpark-manager.entity';
import {
  CreateCarparkManagerRequest,
  UpdateCarparkManagerRequest,
} from './carpark-manager.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { SubCarParkService } from '../sub-car-park/sub-car-park.service';

@Injectable()
export class CarparkManagerService {
  constructor(
    @InjectRepository(CarparkManager)
    private carparkManagerRepository: Repository<CarparkManager>,
  ) { }

  async create(carparkManagerDto: CreateCarparkManagerRequest): Promise<CarparkManager> {
    // check if the manager code exists in the db
    const managerInDb = await this.carparkManagerRepository.findOne({
      where: { managerCode: carparkManagerDto.managerCode },
    });
    if (managerInDb) {
      throw new CustomException(
        ErrorCode.MANAGER_CODE_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { subCarParks, ...entityData } = carparkManagerDto;

    const carparkManager = this.carparkManagerRepository.create(entityData);
    return await this.carparkManagerRepository.save(carparkManager);
  }

  async findAll(options?: FindManyOptions<CarparkManager>): Promise<CarparkManager[]> {
    return await this.carparkManagerRepository.find(options);
  }

  async findOne(options?: FindOneOptions<CarparkManager>): Promise<CarparkManager> {
    const carparkManager = await this.carparkManagerRepository.findOne(options);
    return carparkManager;
  }

  async update(id: string, updateCarparkManagerDto: UpdateCarparkManagerRequest) {
    const carparkManager = await this.carparkManagerRepository.findOne({ where: { id } });
    if (!carparkManager) {
      throw new CustomException(
        ErrorCode.CARPARK_MANAGER_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    Object.assign(carparkManager, updateCarparkManagerDto);
    return await this.carparkManagerRepository.save(carparkManager);
  }

  remove(id: string) {
    return `This action removes a #${id} carpark manager`;
  }
}
