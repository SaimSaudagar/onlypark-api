import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { PatrolOfficer } from './entities/patrol-officer.entity';

@Injectable()
export class PatrolOfficerService {
  constructor(
    @InjectRepository(PatrolOfficer)
    private patrolOfficerRepository: Repository<PatrolOfficer>,
  ) {}

  async create(createDto: any): Promise<PatrolOfficer> {
    const entity = this.patrolOfficerRepository.create(createDto);
    const savedEntity = await this.patrolOfficerRepository.save(entity);
    return savedEntity as unknown as PatrolOfficer;
  }

  async findAll(options?: FindManyOptions<PatrolOfficer>): Promise<PatrolOfficer[]> {
    return await this.patrolOfficerRepository.find(options);
  }

  async findOne(options?: FindOneOptions<PatrolOfficer>): Promise<PatrolOfficer> {
    return await this.patrolOfficerRepository.findOne(options);
  }

  async update(id: string, updateDto: any) {
    const entity = await this.patrolOfficerRepository.findOne({ where: { id } });
    if (entity) {
      Object.assign(entity, updateDto);
      return await this.patrolOfficerRepository.save(entity);
    }
    return null;
  }

  remove(id: string) {
    return `This action removes a #${id} patrol officer`;
  }
}
