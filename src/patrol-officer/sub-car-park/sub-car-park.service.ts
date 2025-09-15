import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, In, ILike } from 'typeorm';
import { SubCarPark } from '../../sub-car-park/entities/sub-car-park.entity';
import { Repository } from 'typeorm';
import { FindSubCarParkRequest, FindSubCarParkResponse } from './sub-car-park.dto';
import { ApiGetBaseResponse } from '../../common/types';
import { BaseService } from '../../common/base.service';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from '../../common/services/request-context/request-context.service';
import { DataSource } from 'typeorm';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { PatrolOfficer } from '../entities/patrol-officer.entity';

@Injectable()
export class SubCarParkService extends BaseService {
    constructor(
        @InjectRepository(SubCarPark)
        private subCarParkRepository: Repository<SubCarPark>,
        requestContextService: RequestContextService,
        configService: ConfigService,
        datasource: DataSource,
        @InjectRepository(PatrolOfficer)
        private readonly patrolOfficerRepository: Repository<PatrolOfficer>,
    ) {
        super(
            requestContextService,
            configService,
            datasource,
            SubCarParkService.name,
        );
    }

    async findAll(request: FindSubCarParkRequest): Promise<ApiGetBaseResponse<FindSubCarParkResponse>> {
        const { pageNo, pageSize, sortField, sortOrder, search, status } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<SubCarPark> = {};
        const orderOptions: FindOptionsOrder<SubCarPark> = {};

        const assignedSubCarParkIds = await this.getAssignedSubCarParks();

        if (search) {
            whereOptions.carParkName = ILike(`%${search}%`);
        }

        if (status) {
            whereOptions.status = status;
        }

        if (sortField) {
            orderOptions[sortField] = sortOrder;
        }

        // Filter by assigned sub car parks at the database level
        if (assignedSubCarParkIds && assignedSubCarParkIds.length > 0) {
            whereOptions.id = In(assignedSubCarParkIds);
        }

        const query: FindManyOptions<SubCarPark> = {
            where: whereOptions,
            order: orderOptions,
            relations: {
                masterCarPark: true,
            },
            skip,
            take,
        };

        const [subCarParks, totalItems] = await this.subCarParkRepository.findAndCount(query);

        // Map the results to response format
        const response: FindSubCarParkResponse[] = subCarParks.map(subCarPark => ({
            id: subCarPark.id,
            carParkName: subCarPark.carParkName,
            carSpace: subCarPark.carSpace,
            location: subCarPark.location,
            lat: subCarPark.lat,
            lang: subCarPark.lang,
            description: subCarPark.description,
            subCarParkCode: subCarPark.subCarParkCode,
            freeHours: subCarPark.freeHours,
            tenantEmailCheck: subCarPark.tenantEmailCheck,
            geolocation: subCarPark.geolocation,
            event: subCarPark.event,
            eventDate: subCarPark.eventDate,
            eventExpiryDate: subCarPark.eventExpiryDate,
            status: subCarPark.status,
            masterCarParkId: subCarPark.masterCarParkId,
            masterCarPark: subCarPark.masterCarPark ? {
                id: subCarPark.masterCarPark.id,
                carParkName: subCarPark.masterCarPark.carParkName,
                masterCarParkCode: subCarPark.masterCarPark.masterCarParkCode,
                carParkType: subCarPark.masterCarPark.carParkType,
                status: subCarPark.masterCarPark.status,
            } : undefined,
        }));

        return {
            rows: response,
            pagination: {
                size: pageSize,
                page: pageNo,
                totalPages: Math.ceil(totalItems / pageSize),
                totalItems,
            },
        };
    }

    private async getAssignedSubCarParks(): Promise<string[]> {
        const userId = this.authenticatedUser.id;

        if (!userId) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const patrolOfficer = await this.patrolOfficerRepository.findOne({
            where: { user: { id: userId } },
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

    async findByAssignmentType(request: FindSubCarParkRequest, assignmentType: 'visitor' | 'whitelist' | 'blacklist'): Promise<ApiGetBaseResponse<FindSubCarParkResponse>> {
        const { pageNo, pageSize, sortField, sortOrder, search, status } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<SubCarPark> = {};
        const orderOptions: FindOptionsOrder<SubCarPark> = {};

        const assignedSubCarParkIds = await this.getAssignedSubCarParksByType(assignmentType);

        if (search) {
            whereOptions.carParkName = ILike(`%${search}%`);
        }

        if (status) {
            whereOptions.status = status;
        }

        if (sortField) {
            orderOptions[sortField] = sortOrder;
        }

        // Filter by assigned sub car parks at the database level
        if (assignedSubCarParkIds && assignedSubCarParkIds.length > 0) {
            whereOptions.id = In(assignedSubCarParkIds);
        }

        const query: FindManyOptions<SubCarPark> = {
            where: whereOptions,
            order: orderOptions,
            relations: {
                masterCarPark: true,
            },
            skip,
            take,
        };

        const [subCarParks, totalItems] = await this.subCarParkRepository.findAndCount(query);

        // Map the results to response format
        const response: FindSubCarParkResponse[] = subCarParks.map(subCarPark => ({
            id: subCarPark.id,
            carParkName: subCarPark.carParkName,
            carSpace: subCarPark.carSpace,
            location: subCarPark.location,
            lat: subCarPark.lat,
            lang: subCarPark.lang,
            description: subCarPark.description,
            subCarParkCode: subCarPark.subCarParkCode,
            freeHours: subCarPark.freeHours,
            tenantEmailCheck: subCarPark.tenantEmailCheck,
            geolocation: subCarPark.geolocation,
            event: subCarPark.event,
            eventDate: subCarPark.eventDate,
            eventExpiryDate: subCarPark.eventExpiryDate,
            status: subCarPark.status,
            masterCarParkId: subCarPark.masterCarParkId,
            masterCarPark: subCarPark.masterCarPark ? {
                id: subCarPark.masterCarPark.id,
                carParkName: subCarPark.masterCarPark.carParkName,
                masterCarParkCode: subCarPark.masterCarPark.masterCarParkCode,
                carParkType: subCarPark.masterCarPark.carParkType,
                status: subCarPark.masterCarPark.status,
            } : undefined,
        }));

        return {
            rows: response,
            pagination: {
                size: pageSize,
                page: pageNo,
                totalPages: Math.ceil(totalItems / pageSize),
                totalItems,
            },
        };
    }

    private async getAssignedSubCarParksByType(assignmentType: 'visitor' | 'whitelist' | 'blacklist'): Promise<string[]> {
        const userId = this.authenticatedUser.id;

        if (!userId) {
            throw new CustomException(
                ErrorCode.USER_NOT_FOUND.key,
                HttpStatus.NOT_FOUND,
            );
        }

        const patrolOfficer = await this.patrolOfficerRepository.findOne({
            where: { user: { id: userId } },
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
