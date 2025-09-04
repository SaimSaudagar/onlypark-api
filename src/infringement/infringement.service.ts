import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Infringement } from './entities/infringement.entity';
import {
  CreateInfringementRequest,
  UpdateInfringementRequest,
} from './infringement.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class InfringementService {
  constructor(
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>,
  ) { }

  async create(infringementDto: CreateInfringementRequest): Promise<Infringement> {
    const infringement = this.infringementRepository.create({
      ...infringementDto,
      ticketDate: new Date(infringementDto.ticketDate),
      dueDate: infringementDto.dueDate ? new Date(infringementDto.dueDate) : undefined,
    });
    return await this.infringementRepository.save(infringement);
  }

  async findAll(options?: FindManyOptions<Infringement>): Promise<Infringement[]> {
    return await this.infringementRepository.find(options);
  }

  async findOne(id: string): Promise<Infringement> {
    const infringement = await this.infringementRepository.findOne({
      where: { ticketNumber: Number(id) },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    return infringement;
  }

  async update(ticketNumber: string, updateInfringementDto: UpdateInfringementRequest) {
    const infringement = await this.infringementRepository.findOne({ where: { ticketNumber: Number(ticketNumber) } });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    Object.assign(infringement, updateInfringementDto);
    return await this.infringementRepository.save(infringement);
  }

  remove(id: string) {
    const infringement = this.infringementRepository.findOne({ where: { ticketNumber: Number(id) } });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.infringementRepository.delete(id);
  }
}
