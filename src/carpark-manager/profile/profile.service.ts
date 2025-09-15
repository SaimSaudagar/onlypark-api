import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CarparkManager } from '../entities/carpark-manager.entity';
import {
    CreateProfileRequest,
    UpdateProfileRequest,
} from './profile.dto';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(CarparkManager)
        private carparkManagerRepository: Repository<CarparkManager>,
    ) { }

    async create(profileDto: CreateProfileRequest): Promise<CarparkManager> {
        // check if the manager code exists in the db
        const managerInDb = await this.carparkManagerRepository.findOne({
            where: { user: { id: profileDto.userId } },
        });
        if (managerInDb) {
            throw new CustomException(
                ErrorCode.CARPARK_MANAGER_ALREADY_EXISTS.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const { ...entityData } = profileDto;

        const carparkManager = this.carparkManagerRepository.create(entityData);
        return await this.carparkManagerRepository.create(carparkManager);
    }

    async findAll(options?: FindManyOptions<CarparkManager>): Promise<CarparkManager[]> {
        return await this.carparkManagerRepository.find(options);
    }

    async findOne(options?: FindOneOptions<CarparkManager>): Promise<CarparkManager> {
        const carparkManager = await this.carparkManagerRepository.findOne(options);
        return carparkManager;
    }

    async update(id: string, updateProfileDto: UpdateProfileRequest) {
        const carparkManager = await this.carparkManagerRepository.findOne({ where: { id } });
        if (!carparkManager) {
            throw new CustomException(
                ErrorCode.CARPARK_MANAGER_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        Object.assign(carparkManager, updateProfileDto);
        return await this.carparkManagerRepository.create(carparkManager);
    }

    remove(id: string) {
        return `This action removes a #${id} carpark manager`;
    }
}
