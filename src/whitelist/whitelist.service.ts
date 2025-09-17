import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Whitelist } from './entities/whitelist.entity';
import { CreateSelfServeWhitelistRequest, CreateSelfServeWhitelistResponse } from './whitelist.dto';
import { ErrorCode } from 'src/common/exceptions/error-code';
import { CustomException } from 'src/common/exceptions/custom.exception';
import { SubCarPark } from 'src/sub-car-park/entities/sub-car-park.entity';
import { Tenancy } from 'src/tenancy/entities/tenancy.entity';
import { WhitelistType } from 'src/common/enums';

@Injectable()
export class WhitelistService {
    constructor(
        @InjectRepository(Whitelist)
        private whitelistRepository: Repository<Whitelist>,
        @InjectRepository(SubCarPark)
        private subCarParkRepository: Repository<SubCarPark>,
        @InjectRepository(Tenancy)
        private tenancyRepository: Repository<Tenancy>,
    ) { }

    async createSelfServeWhitelist(request: CreateSelfServeWhitelistRequest): Promise<CreateSelfServeWhitelistResponse> {
        const { registrationNumber, email, subCarParkId, tenancyId } = request;

        const existingWhitelist = await this.whitelistRepository.findOne({ where: { registrationNumber, email, subCarParkId, tenancyId } });
        if (existingWhitelist) {
            throw new CustomException(
                ErrorCode.WHITELIST_PERMIT_ALREADY_EXISTS.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const subCarPark = await this.subCarParkRepository.exists({ where: { id: subCarParkId } });
        if (!subCarPark) {
            throw new CustomException(
                ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const tenancy = await this.tenancyRepository.exists({ where: { id: tenancyId, subCarParkId } });
        if (!tenancy) {
            throw new CustomException(
                ErrorCode.TENANCY_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const entity = this.whitelistRepository.create({
            registrationNumber,
            email,
            subCarParkId,
            tenancyId,
            whitelistType: WhitelistType.SELF_SERVE,
            comments: 'Self serve whitelist',
        });

        const savedEntity = await this.whitelistRepository.save(entity);
        return {
            id: savedEntity.id,
            registrationNumber: savedEntity.registrationNumber,
            email: savedEntity.email,
            comments: savedEntity.comments,
            subCarParkId: savedEntity.subCarParkId,
            tenancyId: savedEntity.tenancyId,
            whitelistType: savedEntity.whitelistType,
        };
    }
}
