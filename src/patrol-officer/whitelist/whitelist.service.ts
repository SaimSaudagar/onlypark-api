import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, Between, FindOptionsOrder, FindOptionsWhere, ILike, In } from 'typeorm';
import { Whitelist } from '../../whitelist/entities/whitelist.entity';
import { CreateWhitelistRequest, CreateWhitelistResponse, FindWhitelistRequest, FindWhitelistResponse, UpdateWhitelistRequest, UpdateWhitelistResponse, GetAssignedSubCarParksResponse } from './whitelist.dto';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { ApiGetBaseResponse } from '../../common/types';
import { BaseService } from '../../common/base.service';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from '../../common/services/request-context/request-context.service';
import { DataSource } from 'typeorm';
import { PatrolOfficer } from '../entities/patrol-officer.entity';

@Injectable()
export class WhitelistService extends BaseService {
    constructor(
        @InjectRepository(Whitelist)
        private readonly whitelistRepository: Repository<Whitelist>,
        @InjectRepository(PatrolOfficer)
        private readonly patrolOfficerRepository: Repository<PatrolOfficer>,
        requestContextService: RequestContextService,
        configService: ConfigService,
        datasource: DataSource,
    ) {
        super(
            requestContextService,
            configService,
            datasource,
            WhitelistService.name,
        );
    }

    async create(request: CreateWhitelistRequest): Promise<CreateWhitelistResponse> {
        const { registrationNumber, email, comments, subCarParkId, type, duration, startDate, endDate, tenancyId } = request;

        // Check if the user has access to this sub car park
        const assignedSubCarParkIds = await this.getAssignedSubCarParks();
        if (!assignedSubCarParkIds.some(subCarPark => subCarPark.subCarParkId === subCarParkId)) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
                HttpStatus.FORBIDDEN,
            );
        }

        const savedWhitelist = await this.whitelistRepository.save({
            registrationNumber,
            email,
            comments,
            subCarParkId,
            whitelistType: type,
            startDate,
            endDate,
            tenancyId,
            status: 'ACTIVE' as any, // Assuming ACTIVE is the default status
        });

        return {
            id: savedWhitelist.id,
            registrationNumber: savedWhitelist.registrationNumber,
            email: savedWhitelist.email,
            comments: savedWhitelist.comments,
        };
    }

    async findAll(request: FindWhitelistRequest): Promise<ApiGetBaseResponse<FindWhitelistResponse>> {
        const { search, dateFrom, dateTo, type, sortField, sortOrder, pageNo, pageSize } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<Whitelist> = {};
        const orderOptions: FindOptionsOrder<Whitelist> = {};

        // Filter by assigned sub car parks
        const assignedSubCarParks = await this.getAssignedSubCarParks();
        if (assignedSubCarParks.length > 0) {
            const subCarParkIds = assignedSubCarParks.map(subCarPark => subCarPark.subCarParkId);
            whereOptions.subCarParkId = In(subCarParkIds);
        }

        if (dateFrom && dateTo) {
            whereOptions.startDate = Between(dateFrom, dateTo);
        }

        if (search) {
            whereOptions.registrationNumber = ILike(`%${search}%`);
            whereOptions.email = ILike(`%${search}%`);
        }

        if (type) {
            whereOptions.whitelistType = type;
        }

        if (sortField) {
            orderOptions[sortField] = sortOrder;
        }

        const query: FindManyOptions<Whitelist> = {
            where: whereOptions,
            order: orderOptions,
            relations: {
                subCarPark: true,
                tenancy: true,
            },
            skip,
            take,
        };

        const [whitelist, totalItems] = await this.whitelistRepository.findAndCount(query);

        let response: FindWhitelistResponse[] = [];
        response = whitelist.map(whitelist => ({
            id: whitelist.id,
            registrationNumber: whitelist.registrationNumber,
            email: whitelist.email,
            startDate: whitelist.startDate,
            endDate: whitelist.endDate,
            type: whitelist.whitelistType,
            status: whitelist.status,
            createdAt: whitelist.createdAt,
            subCarPark: {
                id: whitelist.subCarPark.id,
                carParkName: whitelist.subCarPark.carParkName,
            },
            tenancy: {
                id: whitelist.tenancy.id,
                tenancyName: whitelist.tenancy.tenantName,
            },
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

    async findOne(options: FindOneOptions<Whitelist>): Promise<Whitelist> {
        const entity = await this.whitelistRepository.findOne(options);
        if (!entity) {
            throw new CustomException(
                ErrorCode.WHITELIST_ENTRY_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check if the user has access to this whitelist entry
        const assignedSubCarParkIds = await this.getAssignedSubCarParks();
        if (!assignedSubCarParkIds.some(subCarPark => subCarPark.subCarParkId === entity.subCarParkId)) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
                HttpStatus.FORBIDDEN,
            );
        }

        return entity;
    }

    async update(id: string, request: UpdateWhitelistRequest): Promise<UpdateWhitelistResponse> {
        const entity = await this.whitelistRepository.findOne({ where: { id } });
        if (!entity) {
            throw new CustomException(
                ErrorCode.WHITELIST_ENTRY_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check if the user has access to this whitelist entry
        const assignedSubCarParkIds = await this.getAssignedSubCarParks();
        if (!assignedSubCarParkIds.some(subCarPark => subCarPark.subCarParkId === entity.subCarParkId)) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
                HttpStatus.FORBIDDEN,
            );
        }

        const updatedEntity = await this.whitelistRepository.save({
            ...entity,
            ...request,
        });

        return {
            id: updatedEntity.id,
            registrationNumber: updatedEntity.registrationNumber,
            email: updatedEntity.email,
            comments: updatedEntity.comments,
        };
    }

    async remove(id: string): Promise<void> {
        const entity = await this.whitelistRepository.findOne({ where: { id } });
        if (!entity) {
            throw new CustomException(
                ErrorCode.WHITELIST_ENTRY_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check if the user has access to this whitelist entry
        const assignedSubCarParkIds = await this.getAssignedSubCarParks();
        if (!assignedSubCarParkIds.some(subCarPark => subCarPark.subCarParkId === entity.subCarParkId)) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_ASSIGNED_TO_USER.key,
                HttpStatus.FORBIDDEN,
            );
        }

        await this.whitelistRepository.delete(id);
    }

    async getAssignedSubCarParks(): Promise<GetAssignedSubCarParksResponse[]> {
        const userId = this.authenticatedUser.id;

        if (!userId) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const patrolOfficer = await this.patrolOfficerRepository.findOne({
            where: { userId: userId },
            relations: {
                patrolOfficerWhitelistSubCarParks: {
                    subCarPark: true,
                }
            }
        });

        if (!patrolOfficer) {
            throw new CustomException(
                ErrorCode.PATROL_OFFICER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        return patrolOfficer.patrolOfficerWhitelistSubCarParks?.map(assignment => ({
            subCarParkId: assignment.subCarPark.id,
            subCarParkName: assignment.subCarPark.carParkName,
        })) || [];
    }
}
