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
import { ApiGetBaseResponse, WhitelistStatus, WhitelistType } from '../../common';

@Injectable()
export class WhitelistService {
    constructor(
        @InjectRepository(Whitelist)
        private whitelistRepository: Repository<Whitelist>,
        private subCarParkService: SubCarParkService,
        private tenancyService: TenancyService,
    ) { }

    async findAll(request: FindWhitelistRequest): Promise<ApiGetBaseResponse<FindWhitelistResponse>> {
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

        const [whitelists, totalItems] = await this.whitelistRepository.findAndCount({
            ...whereOptions,
            order: orderOptions,
            skip,
            take,
            relations: {
                subCarPark: true,
                tenancy: true,
            },
        });

        const response = whitelists.map(whitelist => ({
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
        const { type } = request;

        // Route to appropriate booking type handler
        switch (type) {
            case WhitelistType.HOUR:
                return await this.createHourlyBooking(request);
            case WhitelistType.DATE:
                return await this.createDateBooking(request);
            case WhitelistType.PERMANENT:
                return await this.createPermanentBooking(request);
            default:
                throw new CustomException(
                    ErrorCode.CLIENT_ERROR.key,
                    HttpStatus.BAD_REQUEST,
                );
        }
    }

    private async createHourlyBooking(request: CreateWhitelistRequest): Promise<CreateWhitelistResponse> {
        const { registrationNumber, email, subCarParkId, tenancyId, duration, startDate } = request;

        // Validate required fields for hourly booking
        if (!duration || !startDate) {
            throw new CustomException(
                ErrorCode.CLIENT_ERROR.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Validate subCarPark
        const subCarPark = await this.subCarParkService.findOne({ where: { id: subCarParkId } });
        if (!subCarPark) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        // Validate tenancy
        const tenancy = await this.tenancyService.findOne({ where: { id: tenancyId } });
        if (!tenancy) {
            throw new CustomException(
                ErrorCode.TENANCY_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        // Calculate start and end dates for hourly booking
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(startDateObj.getTime() + (duration * 60 * 60 * 1000)); // duration in hours

        if (duration <= 0) {
            throw new CustomException(
                ErrorCode.INVALID_DURATION.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const whitelist = await this.whitelistRepository.save({
            registrationNumber,
            email,
            subCarParkId,
            tenancyId,
            whitelistType: WhitelistType.HOUR,
            duration,
            startDate: startDateObj,
            endDate: endDateObj,
            status: WhitelistStatus.ACTIVE
        });

        return {
            id: whitelist.id,
            registrationNumber: whitelist.registrationNumber,
            email: whitelist.email,
        };
    }

    private async createDateBooking(request: CreateWhitelistRequest): Promise<CreateWhitelistResponse> {
        const { registrationNumber, email, subCarParkId, tenancyId, startDate, endDate } = request;

        // Validate required fields for date booking
        if (!startDate || !endDate) {
            throw new CustomException(
                ErrorCode.CLIENT_ERROR.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Validate subCarPark
        const subCarPark = await this.subCarParkService.findOne({ where: { id: subCarParkId } });
        if (!subCarPark) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        // Validate tenancy
        const tenancy = await this.tenancyService.findOne({ where: { id: tenancyId } });
        if (!tenancy) {
            throw new CustomException(
                ErrorCode.TENANCY_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        // Validate date range
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (startDateObj >= endDateObj) {
            throw new CustomException(
                ErrorCode.INVALID_DATE_RANGE.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const whitelist = await this.whitelistRepository.save({
            registrationNumber,
            email,
            subCarParkId,
            tenancyId,
            whitelistType: WhitelistType.DATE,
            startDate: startDateObj,
            endDate: endDateObj,
            status: WhitelistStatus.ACTIVE
        });

        return {
            id: whitelist.id,
            registrationNumber: whitelist.registrationNumber,
            email: whitelist.email,
        };
    }

    private async createPermanentBooking(request: CreateWhitelistRequest): Promise<CreateWhitelistResponse> {
        const { registrationNumber, email, subCarParkId, tenancyId } = request;

        // Validate subCarPark
        const subCarPark = await this.subCarParkService.findOne({ where: { id: subCarParkId } });
        if (!subCarPark) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        // Validate tenancy
        const tenancy = await this.tenancyService.findOne({ where: { id: tenancyId } });
        if (!tenancy) {
            throw new CustomException(
                ErrorCode.TENANCY_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const startDateObj = new Date();
        const endDateObj = new Date(startDateObj.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years

        const whitelist = await this.whitelistRepository.save({
            registrationNumber,
            email,
            subCarParkId,
            tenancyId,
            whitelistType: WhitelistType.PERMANENT,
            startDate: startDateObj,
            endDate: endDateObj,
            status: WhitelistStatus.ACTIVE
        });

        return {
            id: whitelist.id,
            registrationNumber: whitelist.registrationNumber,
            email: whitelist.email,
        };
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
