import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity';
import {
    CreateDisputeRequest,
    CreateDisputeResponse,
    FindDisputeRequest,
    FindDisputeResponse,
    FindOneDisputeResponse,
    UpdateDisputeResponse,
    UpdateDisputeStatusRequest,
} from './dispute.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { DisputeStatus } from '../common/enums';
import { InfringementService } from '../infringement/infringement.service';
import { ApiGetBaseResponse } from '../common';

@Injectable()
export class DisputeService {
    constructor(
        @InjectRepository(Dispute)
        private disputeRepository: Repository<Dispute>,
        private infringementService: InfringementService,
    ) { }

    async create(request: CreateDisputeRequest): Promise<CreateDisputeResponse> {
        const {
            firstName,
            lastName,
            companyName,
            address,
            state,
            zipCode,
            mobileNumber,
            email,
            carMakeId,
            model,
            registrationNo,
            appeal,
            photos,
            ticketNumber,
        } = request;

        const infringementId = await this.infringementService.getInfringementId({ registrationNo, ticketNumber });

        const dispute = await this.disputeRepository.save({
            infringementId,
            firstName,
            lastName,
            companyName,
            address,
            state,
            zipCode,
            mobileNumber,
            email,
            carMakeId,
            model,
            registrationNo,
            appeal,
            photos,
            status: DisputeStatus.PENDING,
        });

        return {
            id: dispute.id,
            infringementId: dispute.infringementId,
            registrationNo: dispute.registrationNo,
            status: dispute.status,
        };
    }

    async findAll(request: FindDisputeRequest): Promise<ApiGetBaseResponse<FindDisputeResponse>> {
        const { search, sortField, sortOrder, pageNo, pageSize } = request;
        const skip = (pageNo - 1) * pageSize;
        const take = pageSize;

        const whereOptions: FindOptionsWhere<Dispute> = {};
        const orderOptions: FindOptionsOrder<Dispute> = {};

        if (search) {
            whereOptions.registrationNo = ILike(`%${search}%`);
            whereOptions.email = ILike(`%${search}%`);
        }

        if (sortField) {
            orderOptions[sortField] = sortOrder;
        }

        const query: FindManyOptions<Dispute> = {
            where: whereOptions,
            order: orderOptions,
            relations: {
                infringement: true,
                carMake: true,
            },
            skip,
            take,
        };

        const [disputes, totalItems] = await this.disputeRepository.findAndCount(query);

        let response: FindDisputeResponse[] = [];
        response = disputes.map(dispute => ({
            id: dispute.id,
            registrationNo: dispute.registrationNo,
            email: dispute.email,
            date: dispute.createdAt.toISOString(),
            status: dispute.status,
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

    async findById(id: string): Promise<FindOneDisputeResponse> {
        const dispute = await this.disputeRepository.findOne({
            where: { id },
            relations: {
                infringement: true,
                carMake: true,
            },
        });

        if (!dispute) {
            throw new CustomException(
                ErrorCode.DISPUTE_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        let response: FindOneDisputeResponse = {
            id: dispute.id,
            firstName: dispute.firstName,
            lastName: dispute.lastName,
            companyName: dispute.companyName,
            carMakeName: dispute.carMake.carMakeName,
            carParkName: dispute.infringement.carParkName,
            address: dispute.address,
            state: dispute.state,
            zipCode: dispute.zipCode,
            mobileNumber: dispute.mobileNumber,
            registrationNo: dispute.registrationNo,
            email: dispute.email,
            appeal: dispute.appeal,
            photos: dispute.photos,
            model: dispute.model,
            status: dispute.status,
            date: dispute.createdAt.toISOString(),
        };
        return response;
    }

    async remove(id: string): Promise<void> {
        const dispute = await this.disputeRepository.findOne({ where: { id } });
        if (!dispute) {
            throw new CustomException(
                ErrorCode.DISPUTE_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.disputeRepository.delete(id);
    }

    async updateStatus(request: UpdateDisputeStatusRequest): Promise<UpdateDisputeResponse> {
        const { id, status, responseReason } = request;

        const dispute = await this.disputeRepository.findOne({ where: { id } });
        if (!dispute) {
            throw new CustomException(
                ErrorCode.DISPUTE_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.disputeRepository.update(id, { status, responseReason });

        return {
            id,
            status,
            responseReason,
        };
    }
}
