import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Dispute } from "./entities/dispute.entity";
import { CreateDisputeRequest, CreateDisputeResponse } from "./dispute.dto";
import { InfringementService } from "../admin/infringement/infringement.service";
import { InfringementStatus } from "../common/enums";

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

        //change status to unpaid
        const infringementId = await this.infringementService.getInfringementId({ registrationNo, ticketNumber });

        await this.infringementService.updateStatus(infringementId, { status: InfringementStatus.NOT_PAID });


        // Update infringement status to DISPUTED
        // await this.infringementService.updateStatus(infringementId, { status: InfringementStatus.DISPUTED });

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

        const response = new CreateDisputeResponse();
        response.id = dispute.id;
        response.infringementId = dispute.infringementId;
        response.registrationNo = dispute.registrationNo;
        response.status = dispute.status;
        response.firstName = dispute.firstName;
        response.lastName = dispute.lastName;
        response.companyName = dispute.companyName;
        response.address = dispute.address;
        response.state = dispute.state;
        response.zipCode = dispute.zipCode;
        response.mobileNumber = dispute.mobileNumber;
        response.email = dispute.email;
        response.carMakeId = dispute.carMakeId;
        response.model = dispute.model;
        response.appeal = dispute.appeal;
        response.photos = dispute.photos;
        response.ticketNumber = dispute.ticketNumber;

        return response;
    }
}