import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Dispute } from "./entities/dispute.entity";
import { CreateDisputeRequest, CreateDisputeResponse } from "./dispute.dto";
import { InfringementService } from "../admin/infringement/infringement.service";
import { InfringementStatus } from "../common/enums";
import { CustomException, ErrorCode } from "src/common";
import { EmailNotificationService } from "../common/services/email/email-notification.service";
import { TemplateKeys } from "../common/constants/template-keys";

@Injectable()
export class DisputeService {
    constructor(
        @InjectRepository(Dispute)
        private disputeRepository: Repository<Dispute>,
        private infringementService: InfringementService,
        private emailNotificationService: EmailNotificationService,
        private dataSource: DataSource,
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

        // Get infringement details before starting transaction
        const infringementId = await this.infringementService.getInfringementId({ registrationNo, ticketNumber });
        const infringement = await this.infringementService.findById(infringementId);
        if (infringement.status === InfringementStatus.PAID) {
            throw new CustomException(
                ErrorCode.INFRINGEMENT_ALREADY_PAID.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Start database transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Update infringement status to unpaid
            await this.infringementService.updateStatus(infringementId, { status: InfringementStatus.NOT_PAID });

            // Create dispute record
            const dispute = await queryRunner.manager.save(Dispute, {
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

            // Send email notification to user
            // try {
            //     await this.emailNotificationService.sendUsingTemplate({
            //         to: [dispute.email],
            //         templateKey: TemplateKeys.DISPUTE_RECEIVED,
            //         data: {
            //             name: `${dispute.firstName} ${dispute.lastName}`,
            //             ticketNumber: infringement.ticketNumber.toString(),
            //         },
            //     });
            // } catch (emailError) {
            //     // If email fails, rollback the transaction
            //     await queryRunner.rollbackTransaction();
            //     throw new CustomException(
            //         ErrorCode.EMAIL_SEND_FAILED.key,
            //         HttpStatus.INTERNAL_SERVER_ERROR,
            //         { email: dispute.email, error: emailError.message }
            //     );
            // }

            // Commit transaction
            await queryRunner.commitTransaction();

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
        } catch (error) {
            // Rollback transaction on any error
            await queryRunner.rollbackTransaction();
            throw new CustomException(
                ErrorCode.CLIENT_ERROR.key,
                HttpStatus.BAD_REQUEST,
            );
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }
}