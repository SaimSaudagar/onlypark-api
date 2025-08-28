import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Infringement } from './entities/infringement.entity';
import {
  CreateInfringementRequest,
  UpdateInfringementRequest,
} from './infringement.dto';

@Injectable()
export class InfringementService {
  constructor(
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>,
  ) {}

  async create(infringementDto: CreateInfringementRequest): Promise<Infringement> {
    const infringement = this.infringementRepository.create(infringementDto);
    return await this.infringementRepository.save(infringement);
  }

  async findAll(options?: FindManyOptions<Infringement>): Promise<Infringement[]> {
    return await this.infringementRepository.find(options);
  }

  async findOne(options?: FindOneOptions<Infringement>): Promise<Infringement> {
    const infringement = await this.infringementRepository.findOne(options);
    return infringement;
  }

  async update(ticketNumber: string, updateInfringementDto: UpdateInfringementRequest) {
    const infringement = await this.infringementRepository.findOne({ where: { ticketNumber: Number(ticketNumber) } });
    if (!infringement) {
      throw new BadRequestException('Infringement not found');
    }

    Object.assign(infringement, updateInfringementDto);
    return await this.infringementRepository.save(infringement);
  }

  remove(id: string) {
    return `This action removes a #${id} infringement`;
  }
}
