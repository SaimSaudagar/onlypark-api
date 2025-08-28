import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Tenancy } from './entities/tenancy.entity';

@Injectable()
export class TenancyService {
  constructor(
    @InjectRepository(Tenancy)
    private tenancyRepository: Repository<Tenancy>,
  ) {}

  async create(createDto: any): Promise<Tenancy> {
    const entity = this.tenancyRepository.create(createDto);
    const savedEntity = await this.tenancyRepository.save(entity);
    return savedEntity as unknown as Tenancy;
  }

  async findAll(options?: FindManyOptions<Tenancy>): Promise<Tenancy[]> {
    return await this.tenancyRepository.find(options);
  }

  async findOne(options?: FindOneOptions<Tenancy>): Promise<Tenancy> {
    return await this.tenancyRepository.findOne(options);
  }

  async update(id: string, updateDto: any) {
    const entity = await this.tenancyRepository.findOne({ where: { id } });
    if (entity) {
      Object.assign(entity, updateDto);
      return await this.tenancyRepository.save(entity);
    }
    return null;
  }

  remove(id: string) {
    return `This action removes a #${id} tenancy`;
  }
}
