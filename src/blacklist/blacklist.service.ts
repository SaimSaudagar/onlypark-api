import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { BlacklistReg } from './entities/blacklist-reg.entity';
import { CreateBlacklistDto, UpdateBlacklistDto } from './blacklist.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(BlacklistReg)
    private readonly blacklistRepository: Repository<BlacklistReg>,
  ) { }

  async create(createBlacklistDto: CreateBlacklistDto): Promise<BlacklistReg> {
    const entity = this.blacklistRepository.create(createBlacklistDto);
    return await this.blacklistRepository.save(entity);
  }

  async findAll(options?: FindManyOptions<BlacklistReg>): Promise<BlacklistReg[]> {
    return await this.blacklistRepository.find(options);
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

  async update(id: string, updateBlacklistDto: UpdateBlacklistDto): Promise<BlacklistReg> {
    const entity = await this.blacklistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new CustomException(
        ErrorCode.BLACKLIST_ENTRY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedEntity = await this.blacklistRepository.save({
      ...entity,
      ...updateBlacklistDto,
    });

    return updatedEntity;
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
