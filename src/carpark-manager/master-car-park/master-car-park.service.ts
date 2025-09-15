import { Injectable } from '@nestjs/common';
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
import { CarparkManagerService } from '../carpark-manager.service';
import { CarParkType } from '../../common/enums';

@Injectable()
export class MasterCarParkService extends BaseService {
    constructor(
        @InjectRepository(MasterCarPark)
        private masterCarParkRepository: Repository<MasterCarPark>,
        requestContextService: RequestContextService,
        configService: ConfigService,
        datasource: DataSource,
        private readonly carparkManagerService: CarparkManagerService,
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

        let response: FindMasterCarParkResponse[] = [];

        // Filter master car parks based on assigned sub car parks
        if (assignedSubCarParkIds && assignedSubCarParkIds.length > 0) {
            // Only return master car parks that have assigned sub car parks
            response = masterCarParks
                .filter(masterCarPark => {
                    // Check if this master car park has any sub car parks that are assigned to the carpark manager
                    const hasAssignedSubCarParks = masterCarPark.subCarParks?.some(subCarPark =>
                        assignedSubCarParkIds.includes(subCarPark.id)
                    );
                    return hasAssignedSubCarParks;
                })
                .map(masterCarPark => ({
                    id: masterCarPark.id,
                    carParkName: masterCarPark.carParkName,
                    carParkType: masterCarPark.carParkType,
                    carParkCode: masterCarPark.masterCarParkCode,
                    status: masterCarPark.status,
                    // Only include the assigned sub car parks
                    subCarParks: masterCarPark.subCarParks
                        ?.filter(subCarPark => assignedSubCarParkIds.includes(subCarPark.id))
                        ?.map(subCarPark => ({
                            id: subCarPark.id,
                            carParkName: subCarPark.carParkName,
                            carSpace: subCarPark.carSpace,
                            status: subCarPark.status,
                        })),
                }));
        }

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
        const user = this.authenticatedUser;

        if (!user?.id) {
            return [];
        }

        const carparkManager = await this.carparkManagerService.findOne({
            where: { id: user.id },
            relations: ['subCarParks']
        });

        if (!carparkManager) {
            return [];
        }

        return carparkManager.subCarParks?.map(subCarPark => subCarPark.id) || [];
    }
}
