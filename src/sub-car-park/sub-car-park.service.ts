import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCarPark } from './entities/sub-car-park.entity';
import { GetSubCarParkByCodeResponse } from './sub-car-park.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class SubCarParkService {
    constructor(
        @InjectRepository(SubCarPark)
        private readonly subCarParkRepository: Repository<SubCarPark>,
    ) { }

    async getBySubCarParkCode(subCarParkCode: string): Promise<GetSubCarParkByCodeResponse> {
        const subCarPark = await this.subCarParkRepository.findOne({
            where: { subCarParkCode },
            relations: {
                tenancies: true,
            },
            select: {
                id: true,
                carParkName: true,
                tenancies: {
                    id: true,
                    tenantName: true,
                },
                tenantEmailCheck: true,
            },
        });

        if (!subCarPark) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        return {
            id: subCarPark.id,
            carParkName: subCarPark.carParkName,
            tenantEmailCheck: subCarPark.tenantEmailCheck,
            tenancies: subCarPark.tenancies?.map(tenancy => ({
                id: tenancy.id,
                tenantName: tenancy.tenantName,
            })),
        };
    }
}
