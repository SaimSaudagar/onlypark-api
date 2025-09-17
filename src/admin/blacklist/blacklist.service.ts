import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, Between, FindOptionsOrder, FindOptionsWhere, ILike } from 'typeorm';
import { Blacklist } from '../../blacklist/entities/blacklist-reg.entity';
import { CreateBlacklistRequest, CreateBlacklistResponse, FindBlacklistRequest, FindBlacklistResponse, UpdateBlacklistRequest, UpdateBlacklistResponse } from './blacklist.dto';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { ApiGetBaseResponse } from '../../common/types';
import { SubCarParkService } from '../sub-car-park/sub-car-park.service';

@Injectable()
export class BlacklistService {
    constructor(
        @InjectRepository(Blacklist)
        private readonly blacklistRepository: Repository<Blacklist>,
        private readonly subCarParkService: SubCarParkService,
    ) { }

    async create(request: CreateBlacklistRequest): Promise<CreateBlacklistResponse> {
        const { regNo, email, comments, subCarParkId } = request;

        if (subCarParkId) {
            const subCarPark = await this.subCarParkService.exists(subCarParkId);
            if (!subCarPark) {
                throw new CustomException(
                    ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        const savedBlacklist = await this.blacklistRepository.save({
            regNo,
            email,
            comments,
            subCarParkId,
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

        const whereOptions: FindOptionsWhere<Blacklist> = {};
        const orderOptions: FindOptionsOrder<Blacklist> = {};

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

        const query: FindManyOptions<Blacklist> = {
            where: whereOptions,
            order: orderOptions,
            relations: {
                subCarPark: true,
            },
            skip,
            take,
        };

        const [blacklist, totalItems] = await this.blacklistRepository.findAndCount(query);

        let response: FindBlacklistResponse[] = [];
        response = blacklist.map(blacklist => ({
            id: blacklist.id,
            regNo: blacklist.regNo,
            email: blacklist.email,
            subCarPark: {
                id: blacklist.subCarPark.id,
                subCarParkName: blacklist.subCarPark.carParkName,
            },
            createdAt: blacklist.createdAt,
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

    async findOne(options: FindOneOptions<Blacklist>): Promise<Blacklist> {
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

        const updatedEntity = await this.blacklistRepository.save(entity);

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
        await this.blacklistRepository.softRemove(entity);
    }
}
