import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class WhitelistService {
    constructor(
        @InjectRepository(Whitelist)
        private whitelistRepository: Repository<Whitelist>,
    ) { }

    async findAll(options?: FindManyOptions<Whitelist>): Promise<Whitelist[]> {
        return await this.whitelistRepository.find(options);
    }

    async findOne(options?: FindOneOptions<Whitelist>): Promise<Whitelist> {
        const entity = await this.whitelistRepository.findOne(options);
        if (!entity) {
            throw new CustomException(
                ErrorCode.WHITELIST_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }
        return entity;
    }

    async update(id: string, updateDto: any) {
        const entity = await this.whitelistRepository.findOne({ where: { id } });
        if (!entity) {
            throw new CustomException(
                ErrorCode.WHITELIST_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        Object.assign(entity, updateDto);
        return await this.whitelistRepository.save(entity);
    }

    async remove(id: string) {
        const entity = await this.whitelistRepository.findOne({ where: { id } });
        if (!entity) {
            throw new CustomException(
                ErrorCode.WHITELIST_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        await this.whitelistRepository.remove(entity);
        return { message: 'Whitelist entry removed successfully' };
    }
}
