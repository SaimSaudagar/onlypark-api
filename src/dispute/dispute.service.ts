import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Dispute } from "./entities/dispute.entity";
import { CreateDisputeRequest, CreateDisputeResponse } from "./dispute.dto";
import { InfringementService } from "../admin/infringement/infringement.service";

@Injectable()
export class DisputeService {
    constructor(
        @InjectRepository(Dispute)
        private disputeRepository: Repository<Dispute>,
        private infringementService: InfringementService,
    ) { }

    async create(request: CreateDisputeRequest): Promise<CreateDisputeResponse> {
        const {
            registrationNo,
            ticketNumber,
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
            appeal,
            photos,
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
            ticketNumber,
        });

        return {
            id: dispute.id,
            infringementId: dispute.infringementId,
            registrationNo: dispute.registrationNo,
            status: dispute.status,
            firstName: dispute.firstName,
            lastName: dispute.lastName,
            companyName: dispute.companyName,
            address: dispute.address,
            state: dispute.state,
            zipCode: dispute.zipCode,
            mobileNumber: dispute.mobileNumber,
            email: dispute.email,
            carMakeId: dispute.carMakeId,
            model: dispute.model,
            appeal: dispute.appeal,
            photos: dispute.photos,
            ticketNumber: dispute.ticketNumber,
        };
    }
}