import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { OutstandingRegistration } from './entities/outstanding-registration.entity';

@Injectable()
export class OutstandingRegistrationService {
  constructor(
    @InjectRepository(OutstandingRegistration)
    private outstandingRegistrationRepository: Repository<OutstandingRegistration>,
  ) { }

  async create(createDto: any): Promise<OutstandingRegistration> {
    const entity = this.outstandingRegistrationRepository.create(createDto);
    const savedEntity = await this.outstandingRegistrationRepository.create(entity);
    return savedEntity as unknown as OutstandingRegistration;
  }

  async findAll(options?: FindManyOptions<OutstandingRegistration>): Promise<OutstandingRegistration[]> {
    return await this.outstandingRegistrationRepository.find(options);
  }

  async findOne(options?: FindOneOptions<OutstandingRegistration>): Promise<OutstandingRegistration> {
    return await this.outstandingRegistrationRepository.findOne(options);
  }

  async update(id: string, updateDto: any) {
    const entity = await this.outstandingRegistrationRepository.findOne({ where: { id } });
    if (entity) {
      Object.assign(entity, updateDto);
      return await this.outstandingRegistrationRepository.create(entity);
    }
    return null;
  }

  remove(id: string) {
    return `This action removes a #${id} outstanding registration`;
  }
}
