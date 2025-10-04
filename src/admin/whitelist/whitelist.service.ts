import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { CreateWhitelistRequest, CreateWhitelistResponse, FindWhitelistRequest, FindWhitelistResponse } from './whitelist.dto';
import { SubCarParkService } from '../sub-car-park/sub-car-park.service';
import { TenancyService } from '../../tenancy/tenancy.service';

@Injectable()
export class WhitelistService {
    constructor(
        @InjectRepository(Whitelist)
        private whitelistRepository: Repository<Whitelist>,
        private subCarParkService: SubCarParkService,
        private tenancyService: TenancyService,
    ) { }

    async findAll(request: FindWhitelistRequest): Promise<FindWhitelistResponse[]> {
        const { search, sortField, sortOrder, pageNo, pageSize } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<Whitelist> = {};
        const orderOptions: FindOptionsOrder<Whitelist> = {};

        if (search) {
            whereOptions.registrationNumber = ILike(`%${search}%`);
            whereOptions.email = ILike(`%${search}%`);
        }

        if(sortField){
            orderOptions[sortField] = sortOrder;
        }

        const whitelists = await this.whitelistRepository.find({
            ...whereOptions,
            order: orderOptions,
            skip,
            take,
            relations: {
                subCarPark: true,
                tenancy: true,
            },
        });

        return whitelists.map(whitelist => ({
            id: whitelist.id,
            registrationNumber: whitelist.registrationNumber,
            email: whitelist.email,
            startDate: whitelist.startDate,
            endDate: whitelist.endDate,
            type: whitelist.whitelistType,
            carParkName: whitelist.subCarPark.carParkName,
            tenancyName: whitelist.tenancy.tenantName,
            status: whitelist.status,
        }));
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

    async create(request: CreateWhitelistRequest): Promise<CreateWhitelistResponse> {
        const { registrationNumber, email, subCarParkId, tenancyId, type, duration, startDate, endDate } = request;


        if (subCarParkId) {
            const subCarPark = await this.subCarParkService.findOne({ where: { id: subCarParkId } });
            if (!subCarPark) {
                throw new CustomException(
                    ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                    HttpStatus.NOT_FOUND,
                );
            }
        }       

        if (tenancyId) {
            const tenancy = await this.tenancyService.findOne({ where: { id: tenancyId } });
            if (!tenancy) {
                throw new CustomException(
                    ErrorCode.TENANCY_NOT_FOUND.key,
                    HttpStatus.NOT_FOUND,
                );
            }
        }

        if (startDate) {
            const startDateObj = new Date(startDate);
            if (startDateObj >= new Date(endDate)) {
                throw new CustomException(
                    ErrorCode.INVALID_DATE_RANGE.key,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        if (endDate) {
            const endDateObj = new Date(endDate);
            if (endDateObj <= new Date(startDate)) {
                throw new CustomException(
                    ErrorCode.INVALID_DATE_RANGE.key,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        if (duration) {
            const durationObj = new Date(duration);
            if (durationObj <= new Date(startDate)) {
                throw new CustomException(
                    ErrorCode.INVALID_DURATION.key,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        const entity = await this.whitelistRepository.save({ registrationNumber, email, subCarParkId, tenancyId, type, duration, startDate, endDate });
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
