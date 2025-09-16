import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, In, ILike } from 'typeorm';
import { MasterCarPark } from '../../master-car-park/entities/master-car-park.entity';
import { Repository } from 'typeorm';
import { FindMasterCarParkRequest, FindMasterCarParkResponse } from './master-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import { BaseService } from '../../common/base.service';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from '../../common/services/request-context/request-context.service';
import { DataSource } from 'typeorm';
import { CarParkType } from '../../common/enums';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { CarparkManager } from '../entities/carpark-manager.entity';

@Injectable()
export class MasterCarParkService extends BaseService {
    constructor(
        @InjectRepository(MasterCarPark)
        private masterCarParkRepository: Repository<MasterCarPark>,
        requestContextService: RequestContextService,
        configService: ConfigService,
        datasource: DataSource,
        @InjectRepository(CarparkManager)
        private readonly carparkManagerRepository: Repository<CarparkManager>,
    ) {
        super(
            requestContextService,
            configService,
            datasource,
            MasterCarParkService.name,
        );
    }

    async findAll(request: FindMasterCarParkRequest): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        const { pageNo, pageSize, sortField, sortOrder, search, carParkType, status } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<MasterCarPark> = {};
        const orderOptions: FindOptionsOrder<MasterCarPark> = {};

        const assignedSubCarParkIds = await this.getAssignedSubCarParks();

        if (search) {
            whereOptions.carParkName = ILike(`%${search}%`);
        }

        if (sortField) {
            orderOptions[sortField] = sortOrder;
        }

        if (carParkType) {
            whereOptions.carParkType = carParkType as CarParkType;
        }

        if (status) {
            whereOptions.status = status;
        }

        // Filter by assigned sub car parks at the database level
        if (assignedSubCarParkIds && assignedSubCarParkIds.length > 0) {
            whereOptions.subCarParks = {
                id: In(assignedSubCarParkIds)
            };
        }

        const query: FindManyOptions<MasterCarPark> = {
            where: whereOptions,
            order: orderOptions,
            relations: {
                subCarParks: true,
            },
            skip,
            take,
        };

        const [masterCarParks, totalItems] = await this.masterCarParkRepository.findAndCount(query);

        // Map the results to response format
        const response: FindMasterCarParkResponse[] = masterCarParks.map(masterCarPark => ({
            id: masterCarPark.id,
            carParkName: masterCarPark.carParkName,
            carParkType: masterCarPark.carParkType,
            carParkCode: masterCarPark.masterCarParkCode,
            status: masterCarPark.status,
            subCarParks: masterCarPark.subCarParks
                ?.filter(subCarPark => assignedSubCarParkIds.includes(subCarPark.id))
                ?.map(subCarPark => ({
                    id: subCarPark.id,
                    carParkName: subCarPark.carParkName,
                    carSpace: subCarPark.carSpace,
                    status: subCarPark.status,
                })),
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

    private async getAssignedSubCarParks(): Promise<string[]> {
        const userId = this.authenticatedUser.id;

        if (!userId) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const carparkManager = await this.carparkManagerRepository.findOne({
            where: { userId: userId },
            relations: [
                'carparkManagerVisitorSubCarParks',
                'carparkManagerVisitorSubCarParks.subCarPark',
                'carparkManagerWhitelistSubCarParks',
                'carparkManagerWhitelistSubCarParks.subCarPark',
                'carparkManagerBlacklistSubCarParks',
                'carparkManagerBlacklistSubCarParks.subCarPark'
            ]
        });

        if (!carparkManager) {
            throw new CustomException(
                ErrorCode.CARPARK_MANAGER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        // Collect all assigned sub car park IDs from all assignment types
        const assignedSubCarParkIds = new Set<string>();

        // Add visitor assignments
        carparkManager.carparkManagerVisitorSubCarParks?.forEach(assignment => {
            if (assignment.subCarPark?.id) {
                assignedSubCarParkIds.add(assignment.subCarPark.id);
            }
        });

        // Add whitelist assignments
        carparkManager.carparkManagerWhitelistSubCarParks?.forEach(assignment => {
            if (assignment.subCarPark?.id) {
                assignedSubCarParkIds.add(assignment.subCarPark.id);
            }
        });

        // Add blacklist assignments
        carparkManager.carparkManagerBlacklistSubCarParks?.forEach(assignment => {
            if (assignment.subCarPark?.id) {
                assignedSubCarParkIds.add(assignment.subCarPark.id);
            }
        });

        return Array.from(assignedSubCarParkIds);
    }

    async findByAssignmentType(request: FindMasterCarParkRequest, assignmentType: 'visitor' | 'whitelist' | 'blacklist'): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
        const { pageNo, pageSize, sortField, sortOrder, search, carParkType, status } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<MasterCarPark> = {};
        const orderOptions: FindOptionsOrder<MasterCarPark> = {};

        const assignedSubCarParkIds = await this.getAssignedSubCarParksByType(assignmentType);

        if (search) {
            whereOptions.carParkName = ILike(`%${search}%`);
        }

        if (sortField) {
            orderOptions[sortField] = sortOrder;
        }

        if (carParkType) {
            whereOptions.carParkType = carParkType as CarParkType;
        }

        if (status) {
            whereOptions.status = status;
        }

        // Filter by assigned sub car parks at the database level
        if (assignedSubCarParkIds && assignedSubCarParkIds.length > 0) {
            whereOptions.subCarParks = {
                id: In(assignedSubCarParkIds)
            };
        }

        const query: FindManyOptions<MasterCarPark> = {
            where: whereOptions,
            order: orderOptions,
            relations: {
                subCarParks: true,
            },
            skip,
            take,
        };

        const [masterCarParks, totalItems] = await this.masterCarParkRepository.findAndCount(query);

        // Map the results to response format
        const response: FindMasterCarParkResponse[] = masterCarParks.map(masterCarPark => ({
            id: masterCarPark.id,
            carParkName: masterCarPark.carParkName,
            carParkType: masterCarPark.carParkType,
            carParkCode: masterCarPark.masterCarParkCode,
            status: masterCarPark.status,
            subCarParks: masterCarPark.subCarParks
                ?.filter(subCarPark => assignedSubCarParkIds.includes(subCarPark.id))
                ?.map(subCarPark => ({
                    id: subCarPark.id,
                    carParkName: subCarPark.carParkName,
                    carSpace: subCarPark.carSpace,
                    status: subCarPark.status,
                })),
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

    private async getAssignedSubCarParksByType(assignmentType: 'visitor' | 'whitelist' | 'blacklist'): Promise<string[]> {
        const userId = this.authenticatedUser.id;

        if (!userId) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const carparkManager = await this.carparkManagerRepository.findOne({
            where: { user: { id: userId } },
            relations: [
                'carparkManagerVisitorSubCarParks',
                'carparkManagerVisitorSubCarParks.subCarPark',
                'carparkManagerWhitelistSubCarParks',
                'carparkManagerWhitelistSubCarParks.subCarPark',
                'carparkManagerBlacklistSubCarParks',
                'carparkManagerBlacklistSubCarParks.subCarPark'
            ]
        });

        if (!carparkManager) {
            throw new CustomException(
                ErrorCode.CARPARK_MANAGER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const assignedSubCarParkIds = new Set<string>();

        // Get sub car park IDs based on assignment type
        switch (assignmentType) {
            case 'visitor':
                carparkManager.carparkManagerVisitorSubCarParks?.forEach(assignment => {
                    if (assignment.subCarPark?.id) {
                        assignedSubCarParkIds.add(assignment.subCarPark.id);
                    }
                });
                break;
            case 'whitelist':
                carparkManager.carparkManagerWhitelistSubCarParks?.forEach(assignment => {
                    if (assignment.subCarPark?.id) {
                        assignedSubCarParkIds.add(assignment.subCarPark.id);
                    }
                });
                break;
            case 'blacklist':
                carparkManager.carparkManagerBlacklistSubCarParks?.forEach(assignment => {
                    if (assignment.subCarPark?.id) {
                        assignedSubCarParkIds.add(assignment.subCarPark.id);
                    }
                });
                break;
        }

        return Array.from(assignedSubCarParkIds);
    }
}
