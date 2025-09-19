import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import {
    CreateDisputeRequest,
    CreateDisputeResponse,
    FindDisputeRequest,
    FindDisputeResponse,
    FindOneDisputeResponse,
    UpdateDisputeRequest,
    UpdateDisputeResponse,
    UpdateDisputeStatusRequest,
} from './dispute.dto';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { DisputeStatus, InfringementStatus } from '../../common/enums';
import { InfringementService } from '../infringement/infringement.service';
import { ApiGetBaseResponse } from '../../common';
import { Dispute } from '../../dispute/entities/dispute.entity';

@Injectable()
export class DisputeService {
    constructor(
        @InjectRepository(Dispute)
        private disputeRepository: Repository<Dispute>,
        private infringementService: InfringementService,
    ) { }

    
    //not needed here discuss with saim
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

        // let response: FindDisputeResponse[] = [];
        const response = disputes.map(dispute => ({
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
            carParkName: dispute.infringement.infringementCarPark.carParkName,
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

        await this.disputeRepository.softRemove(dispute);
    }

    async update(request: UpdateDisputeRequest): Promise<UpdateDisputeResponse> {
        const { id, status, responseReason, responsePhotos } = request;

        const dispute = await this.disputeRepository.findOne({ where: { id } });
        if (!dispute) {
            throw new CustomException(
                ErrorCode.DISPUTE_NOT_FOUND.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // If status is provided, call the status-specific function
        if (status) {
            await this.handleStatusUpdate(dispute, status, responseReason || '');
        } else {
            // Just update the dispute data without status change
            await this.disputeRepository.update(id, { 
                responseReason, 
                responsePhotos 
            });
        }

        // Fetch the updated dispute
        const updatedDispute = await this.disputeRepository.findOne({ where: { id } });

        const response = new UpdateDisputeResponse();
        response.id = id;
        response.status = updatedDispute.status;
        response.responseReason = updatedDispute.responseReason;
        response.responsePhotos = updatedDispute.responsePhotos;

        return response;
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

        // Call the appropriate status-specific function
        await this.handleStatusUpdate(dispute, status, responseReason);

        return {
            id,
            status,
            responseReason,
        };
    }

    private async handleStatusUpdate(dispute: Dispute, status: DisputeStatus, responseReason: string): Promise<void> {
        switch (status) {
            case DisputeStatus.APPROVED:
                await this.handleApprovedStatus(dispute, responseReason);
                break;
            case DisputeStatus.REJECTED:
                await this.handleRejectedStatus(dispute, responseReason);
                break;
            case DisputeStatus.PENDING:
                await this.handlePendingStatus(dispute, responseReason);
                break;
            case DisputeStatus.APPROVED_WITH_ADMIN_FEES:
                await this.handleApprovedWithAdminFeesStatus(dispute, responseReason);
                break;
            default:
                // For any other status, throw an error
                throw new CustomException(
                    ErrorCode.DISPUTE_STATUS_NOT_FOUND.key,
                    HttpStatus.BAD_REQUEST,
                );
        }
    }

    private async handleApprovedStatus(dispute: Dispute, responseReason: string): Promise<void> {
        // Update dispute status to approved
        await this.disputeRepository.update(dispute.id, { 
            status: DisputeStatus.APPROVED, 
            responseReason 
        });

        // Change infringement status to waived
        await this.infringementService.updateStatus(dispute.infringementId, { 
            status: InfringementStatus.WAIVED 
        });
    }

    private async handleRejectedStatus(dispute: Dispute, responseReason: string): Promise<void> {
        // Update dispute status to rejected
        await this.disputeRepository.update(dispute.id, { 
            status: DisputeStatus.REJECTED, 
            responseReason 
        });

    }

    private async handlePendingStatus(dispute: Dispute, responseReason: string): Promise<void> {
        // Update dispute status to pending
        await this.disputeRepository.update(dispute.id, { 
            status: DisputeStatus.PENDING, 
            responseReason 
        });

    }

    private async handleApprovedWithAdminFeesStatus(dispute: Dispute, responseReason: string): Promise<void> {
        // Update dispute status to approved with admin fees
        await this.disputeRepository.update(dispute.id, { 
            status: DisputeStatus.APPROVED_WITH_ADMIN_FEES, 
            responseReason 
        });
    }
}
