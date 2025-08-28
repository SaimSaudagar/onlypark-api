import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { BlacklistReg } from './entities/blacklist-reg.entity';
import { CreateBlacklistDto, UpdateBlacklistDto } from './blacklist.dto';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(BlacklistReg)
    private readonly blacklistRepository: Repository<BlacklistReg>,
  ) {}

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
      throw new BadRequestException('Blacklist entry not found');
    }
    return entity;
  }

  async update(id: string, updateBlacklistDto: UpdateBlacklistDto): Promise<BlacklistReg> {
    const entity = await this.blacklistRepository.findOne({ where: { id } });
    if (!entity) {
      throw new BadRequestException('Blacklist entry not found');
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
      throw new BadRequestException('Blacklist entry not found');
    }
    await this.blacklistRepository.delete(id);
  }
}
