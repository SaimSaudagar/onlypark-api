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
import { PatrolOfficerService } from '../patrol-officer.service';
import { CarParkType } from '../../common/enums';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from 'src/common/exceptions/error-code';

@Injectable()
export class MasterCarParkService extends BaseService {
    constructor(
        @InjectRepository(MasterCarPark)
        private masterCarParkRepository: Repository<MasterCarPark>,
        requestContextService: RequestContextService,
        configService: ConfigService,
        datasource: DataSource,
        private readonly patrolOfficerService: PatrolOfficerService,
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

        const patrolOfficer = await this.patrolOfficerService.findOne({
            where: { userId: userId },
            relations: [
                'patrolOfficerVisitorSubCarParks',
                'patrolOfficerVisitorSubCarParks.subCarPark',
                'patrolOfficerWhitelistSubCarParks',
                'patrolOfficerWhitelistSubCarParks.subCarPark',
                'patrolOfficerBlacklistSubCarParks',
                'patrolOfficerBlacklistSubCarParks.subCarPark'
            ]
        });

        if (!patrolOfficer) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        // Collect all assigned sub car park IDs from all assignment types
        const assignedSubCarParkIds = new Set<string>();

        // Add visitor assignments
        patrolOfficer.patrolOfficerVisitorSubCarParks?.forEach(assignment => {
            if (assignment.subCarPark?.id) {
                assignedSubCarParkIds.add(assignment.subCarPark.id);
            }
        });

        // Add whitelist assignments
        patrolOfficer.patrolOfficerWhitelistSubCarParks?.forEach(assignment => {
            if (assignment.subCarPark?.id) {
                assignedSubCarParkIds.add(assignment.subCarPark.id);
            }
        });

        // Add blacklist assignments
        patrolOfficer.patrolOfficerBlacklistSubCarParks?.forEach(assignment => {
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
        } else {
            // If no assigned sub car parks, return empty result immediately
            return {
                rows: [],
                pagination: {
                    size: pageSize,
                    page: pageNo,
                    totalPages: 0,
                    totalItems: 0,
                },
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
        const user = this.authenticatedUser;

        if (!user?.id) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const patrolOfficer = await this.patrolOfficerService.findOne({
            where: { userId: user.id },
            relations: [
                'patrolOfficerVisitorSubCarParks',
                'patrolOfficerVisitorSubCarParks.subCarPark',
                'patrolOfficerWhitelistSubCarParks',
                'patrolOfficerWhitelistSubCarParks.subCarPark',
                'patrolOfficerBlacklistSubCarParks',
                'patrolOfficerBlacklistSubCarParks.subCarPark'
            ]
        });

        if (!patrolOfficer) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const assignedSubCarParkIds = new Set<string>();

        // Get sub car park IDs based on assignment type
        switch (assignmentType) {
            case 'visitor':
                patrolOfficer.patrolOfficerVisitorSubCarParks?.forEach(assignment => {
                    if (assignment.subCarPark?.id) {
                        assignedSubCarParkIds.add(assignment.subCarPark.id);
                    }
                });
                break;
            case 'whitelist':
                patrolOfficer.patrolOfficerWhitelistSubCarParks?.forEach(assignment => {
                    if (assignment.subCarPark?.id) {
                        assignedSubCarParkIds.add(assignment.subCarPark.id);
                    }
                });
                break;
            case 'blacklist':
                patrolOfficer.patrolOfficerBlacklistSubCarParks?.forEach(assignment => {
                    if (assignment.subCarPark?.id) {
                        assignedSubCarParkIds.add(assignment.subCarPark.id);
                    }
                });
                break;
        }

        return Array.from(assignedSubCarParkIds);
    }
}
