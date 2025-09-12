import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Whitelist } from './entities/whitelist.entity';

@Injectable()
export class WhitelistService {
    constructor(
        @InjectRepository(Whitelist)
        private whitelistRepository: Repository<Whitelist>,
    ) { }

    async create(createDto: any): Promise<Whitelist> {
        const entity = this.whitelistRepository.create(createDto);
        const savedEntity = await this.whitelistRepository.create(entity);
        return savedEntity as unknown as Whitelist;
    }

    async findAll(options?: FindManyOptions<Whitelist>): Promise<Whitelist[]> {
        return await this.whitelistRepository.find(options);
    }

    async findOne(options?: FindOneOptions<Whitelist>): Promise<Whitelist> {
        return await this.whitelistRepository.findOne(options);
    }

    async update(id: string, updateDto: any) {
        const entity = await this.whitelistRepository.findOne({ where: { id } });
        if (entity) {
            Object.assign(entity, updateDto);
            return await this.whitelistRepository.create(entity);
        }
        return null;
    }

    remove(id: string) {
        return `This action removes a #${id} whitelist entry`;
    }
}
