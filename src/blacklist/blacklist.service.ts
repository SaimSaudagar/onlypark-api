import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, Between, FindOptionsOrder, FindOptionsWhere, ILike } from 'typeorm';
import { BlacklistReg } from './entities/blacklist-reg.entity';
import { CreateBlacklistRequest, CreateBlacklistResponse, FindBlacklistRequest, FindBlacklistResponse, UpdateBlacklistRequest, UpdateBlacklistResponse } from './blacklist.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { MasterCarParkService } from '../master-car-park/master-car-park.service';
import { BlacklistStatus } from '../common/enums';
import { ApiGetBaseResponse } from '../common/types';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(BlacklistReg)
    private readonly blacklistRepository: Repository<BlacklistReg>,
    private readonly masterCarParkService: MasterCarParkService,
  ) { }

  async create(request: CreateBlacklistRequest): Promise<CreateBlacklistResponse> {
    const { regNo, email, comments, masterCarParkId } = request;

    if (masterCarParkId) {
      const masterCarPark = await this.masterCarParkService.exists(masterCarParkId);
      if (!masterCarPark) {
        throw new CustomException(
          ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const savedBlacklist = await this.blacklistRepository.save({
      regNo,
      email,
      comments,
      masterCarParkId,
    });

    return {
      id: savedBlacklist.id,
      regNo: savedBlacklist.regNo,
      email: savedBlacklist.email,
      comments: savedBlacklist.comments,
    };
  }

  async findAll(request: FindBlacklistRequest): Promise<ApiGetBaseResponse<FindBlacklistResponse>> {
    const { search, dateFrom, dateTo, sortField, sortOrder, pageNo, pageSize } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<BlacklistReg> = {};
    const orderOptions: FindOptionsOrder<BlacklistReg> = {};

    if (dateFrom && dateTo) {
      whereOptions.createdAt = Between(dateFrom, dateTo);
    }

    if (search) {
      whereOptions.regNo = ILike(`%${search}%`);
      whereOptions.email = ILike(`%${search}%`);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const query: FindManyOptions<BlacklistReg> = {
      where: whereOptions,
      order: orderOptions,
      relations: {
        masterCarPark: true,
      },
      skip,
      take,
    };

    const [blacklistRegs, totalItems] = await this.blacklistRepository.findAndCount(query);

    let response: FindBlacklistResponse[] = [];
    response = blacklistRegs.map(blacklistReg => ({
      id: blacklistReg.id,
      regNo: blacklistReg.regNo,
      email: blacklistReg.email,
      masterCarPark: {
        id: blacklistReg.masterCarPark.id,
        masterCarParkName: blacklistReg.masterCarPark.carParkName,
      },
      createdAt: blacklistReg.createdAt,
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

  async findOne(options: FindOneOptions<BlacklistReg>): Promise<BlacklistReg> {
    const entity = await this.blacklistRepository.findOne(options);
    if (!entity) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }
    return entity;
  }

  async update(id: string, request: UpdateBlacklistRequest): Promise<UpdateBlacklistResponse> {
    const entity = await this.blacklistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedEntity = await this.blacklistRepository.save(request);

    return {
      id: updatedEntity.id,
      regNo: updatedEntity.regNo,
      email: updatedEntity.email,
      comments: updatedEntity.comments,
    };
  }

  async remove(id: string): Promise<void> {
    const entity = await this.blacklistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.blacklistRepository.delete(id);
  }
}
