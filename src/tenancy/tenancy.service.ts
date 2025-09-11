import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository, QueryRunner, FindOptionsOrder, FindOptionsWhere, ILike, Or } from 'typeorm';
import { Tenancy } from './entities/tenancy.entity';
import { CreateTenancyRequest, CreateTenancyResponse, FindTenancyRequest, FindTenancyResponse } from './tenancy.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { ApiGetBaseResponse } from '../common/types';

@Injectable()
export class TenancyService {
  constructor(
    @InjectRepository(Tenancy)
    private tenancyRepository: Repository<Tenancy>,
  ) { }

  async create(request: CreateTenancyRequest): Promise<Tenancy> {
    const entity = this.tenancyRepository.create(request);
    const savedEntity = await this.tenancyRepository.create(entity);
    return savedEntity as unknown as Tenancy;
  }

  async createBulk(request: CreateTenancyRequest[], queryRunner: QueryRunner): Promise<CreateTenancyResponse[]> {
    for (const tenant of request) {
      if (!tenant.tenantName || !tenant.tenantEmail) {
        throw new CustomException(
          ErrorCode.INVALID_TENANCY_DATA.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingTenant = await this.findOne({ where: { tenantEmail: tenant.tenantEmail } });

      if (existingTenant) {
        throw new CustomException(
          ErrorCode.TENANT_ALREADY_EXISTS.key,
          HttpStatus.BAD_REQUEST,
          { tenantEmail: tenant.tenantEmail },
        );
      }
    }
    const result = await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Tenancy)
      .values(request.map(tenant => ({
        tenantName: tenant.tenantName,
        tenantEmail: tenant.tenantEmail,
        subCarParkId: tenant.subCarParkId,
      })))
      .returning('*')
      .execute();

    const response = result.raw.map(item => ({
      id: item.id,
      tenantName: item.tenantName,
      tenantEmail: item.tenantEmail,
      subCarParkId: item.subCarParkId,
    }));

    return response;
  }

  async findAll(request: FindTenancyRequest): Promise<ApiGetBaseResponse<FindTenancyResponse>> {
    const { pageNo, pageSize, sortField, sortOrder, search } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;
    console.log(request);
    let whereOptions: FindOptionsWhere<Tenancy>[] = [];
    const orderOptions: FindOptionsOrder<Tenancy> = {};
    if (search) {
      whereOptions = [
        { tenantName: ILike(`%${search}%`) },
        { tenantEmail: ILike(`%${search}%`) }
      ];
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const options: FindManyOptions<Tenancy> = {
      skip,
      take,
      where: whereOptions,
      order: orderOptions,
    };

    const [tenancies, totalItems] = await this.tenancyRepository.findAndCount(options);

    const response = tenancies.map(tenant => ({
      id: tenant.id,
      tenantName: tenant.tenantName,
      tenantEmail: tenant.tenantEmail,
      subCarParkId: tenant.subCarParkId,
    }));

    return {
      rows: response,
      pagination: {
        size: pageSize,
        page: pageNo,
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
      },
    }
  }

  async findOne(options?: FindOneOptions<Tenancy>): Promise<Tenancy> {
    return await this.tenancyRepository.findOne(options);
  }

  async update(id: string, request: Tenancy) {
    const entity = await this.tenancyRepository.findOne({ where: { id } });
    if (entity) {
      Object.assign(entity, request);
      return await this.tenancyRepository.create(entity);
    }
    return null;
  }

  async remove(id: string): Promise<void> {
    await this.tenancyRepository.delete(id);
  }
}
