import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository, QueryRunner } from 'typeorm';
import { Tenancy } from './entities/tenancy.entity';
import { TenancyRequest } from './dto/tenancy.dto';

@Injectable()
export class TenancyService {
  constructor(
    @InjectRepository(Tenancy)
    private tenancyRepository: Repository<Tenancy>,
  ) { }

  async create(request: Tenancy): Promise<Tenancy> {
    const entity = this.tenancyRepository.create(request);
    const savedEntity = await this.tenancyRepository.save(entity);
    return savedEntity as unknown as Tenancy;
  }

  async createBulk(request: Tenancy[]): Promise<Tenancy[]> {
    const entities = this.tenancyRepository.create(request);
    const savedEntities = await this.tenancyRepository.save(entities);
    return savedEntities as unknown as Tenancy[];
  }

  async createBulkWithTransaction(request: TenancyRequest[], queryRunner: QueryRunner): Promise<Tenancy[]> {
    if (request.length === 0) {
      return [];
    }
    const result = await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Tenancy)
      .values(request)
      .returning('*')
      .execute();

    return result as unknown as Tenancy[];
  }

  async findAll(options?: FindManyOptions<Tenancy>): Promise<Tenancy[]> {
    return await this.tenancyRepository.find(options);
  }

  async findOne(options?: FindOneOptions<Tenancy>): Promise<Tenancy> {
    return await this.tenancyRepository.findOne(options);
  }

  async update(id: string, request: Tenancy) {
    const entity = await this.tenancyRepository.findOne({ where: { id } });
    if (entity) {
      Object.assign(entity, request);
      return await this.tenancyRepository.save(entity);
    }
    return null;
  }

  async remove(id: string): Promise<void> {
    await this.tenancyRepository.delete(id);
  }
}
