import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
  DataSource,
} from "typeorm";
import {
  CreateDisputeRequest,
  CreateDisputeResponse,
  FindDisputeRequest,
  FindDisputeResponse,
  FindOneDisputeResponse,
  UpdateDisputeRequest,
  UpdateDisputeResponse,
  UpdateDisputeStatusRequest,
} from "./dispute.dto";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { DisputeStatus, InfringementStatus } from "../../common/enums";
import { InfringementService } from "../infringement/infringement.service";
import { ApiGetBaseResponse } from "../../common";
import { Dispute } from "../../dispute/entities/dispute.entity";
import { EmailNotificationService } from "../../common/services/email/email-notification.service";
import { TemplateKeys } from "../../common/constants/template-keys";

@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    private infringementService: InfringementService,
    private emailNotificationService: EmailNotificationService,
    private dataSource: DataSource
  ) {}

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
      registrationNumber,
      appeal,
      photos,
      ticketNumber,
    } = request;

    const infringementId = await this.infringementService.getInfringementId({
      registrationNumber,
      ticketNumber,
    });

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
      registrationNumber,
      appeal,
      photos,
      status: DisputeStatus.PENDING,
    });

    return {
      id: dispute.id,
      infringementId: dispute.infringementId,
      registrationNumber: dispute.registrationNumber,
      status: dispute.status,
    };
  }

  async findAll(
    request: FindDisputeRequest
  ): Promise<ApiGetBaseResponse<FindDisputeResponse>> {
    const { search, sortField, sortOrder, pageNo, pageSize } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<Dispute> = {};
    const orderOptions: FindOptionsOrder<Dispute> = {};

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const query: FindManyOptions<Dispute> = {
      where: search
        ? [
            { ...whereOptions, registrationNumber: ILike(`%${search}%`) },
            { ...whereOptions, email: ILike(`%${search}%`) },
          ]
        : whereOptions,
      order: orderOptions,
      relations: {
        infringement: true,
        carMake: true,
      },
      skip,
      take,
    };

    const [disputes, totalItems] =
      await this.disputeRepository.findAndCount(query);

    // let response: FindDisputeResponse[] = [];
    const response = disputes.map((dispute) => ({
      id: dispute.id,
      registrationNumber: dispute.registrationNumber,
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
    };
  }

  async findById(id: string): Promise<FindOneDisputeResponse> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: {
        infringement: {
          infringementCarPark: true,
        },
        carMake: true,
      },
    });

    if (!dispute) {
      throw new CustomException(
        ErrorCode.DISPUTE_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const response: FindOneDisputeResponse = {
      id: dispute.id,
      firstName: dispute.firstName,
      lastName: dispute.lastName,
      companyName: dispute.companyName,
      carMakeName: dispute.carMake.carMakeName,
      carParkName: dispute.infringement?.infringementCarPark?.carParkName,
      address: dispute.address,
      state: dispute.state,
      zipCode: dispute.zipCode,
      mobileNumber: dispute.mobileNumber,
      registrationNumber: dispute.registrationNumber,
      email: dispute.email,
      appeal: dispute.appeal,
      photos: dispute.photos,
      responsePhotos: dispute.responsePhotos as string[],
      responseReason: dispute.responseReason,
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
        HttpStatus.BAD_REQUEST
      );
    }

    await this.disputeRepository.softRemove(dispute);
  }

  async update(
    id: string,
    request: UpdateDisputeRequest
  ): Promise<UpdateDisputeResponse> {
    const { status, responseReason, responsePhotos } = request;

    const dispute = await this.disputeRepository.findOne({ where: { id } });
    if (!dispute) {
      throw new CustomException(
        ErrorCode.DISPUTE_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // If status is provided, call the status-specific function
    if (status) {
      await this.handleStatusUpdate(dispute, status, responseReason || "");
    } else {
      // Just update the dispute data without status change
      await this.disputeRepository.update(id, {
        responseReason,
        responsePhotos,
      });
    }

    // Fetch the updated dispute
    const updatedDispute = await this.disputeRepository.findOne({
      where: { id },
    });

    const response = new UpdateDisputeResponse();
    response.id = id;
    response.status = updatedDispute.status;
    response.responseReason = updatedDispute.responseReason;
    response.responsePhotos = updatedDispute.responsePhotos;

    return response;
  }

  async updateStatus(
    request: UpdateDisputeStatusRequest
  ): Promise<UpdateDisputeResponse> {
    const { id, status, responseReason } = request;

    const dispute = await this.disputeRepository.findOne({ where: { id } });
    if (!dispute) {
      throw new CustomException(
        ErrorCode.DISPUTE_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
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

  private async handleStatusUpdate(
    dispute: Dispute,
    status: DisputeStatus,
    responseReason: string
  ): Promise<void> {
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
          HttpStatus.BAD_REQUEST
        );
    }
  }

  private async handleApprovedStatus(
    dispute: Dispute,
    responseReason: string
  ): Promise<void> {
    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update dispute status to approved
      await queryRunner.manager.update(Dispute, dispute.id, {
        status: DisputeStatus.APPROVED,
        responseReason,
      });

      // Change infringement status to waived
      await this.infringementService.updateStatus(dispute.infringementId, {
        status: InfringementStatus.WAIVED,
      });

      console.log("dispute.email", dispute);

      // Send email notification
      try {
        await this.emailNotificationService.sendUsingTemplate({
          to: [dispute.email],
          templateKey: TemplateKeys.DISPUTE_ACCEPTED,
          data: {
            name: `${dispute.firstName} ${dispute.lastName}`,
          },
        });
      } catch (emailError) {
        // If email fails, rollback the transaction
        await queryRunner.rollbackTransaction();
        throw new CustomException(
          ErrorCode.EMAIL_SEND_FAILED.key,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { email: dispute.email, error: emailError.message }
        );
      }

      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  private async handleRejectedStatus(
    dispute: Dispute,
    responseReason: string
  ): Promise<void> {
    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update dispute status to rejected
      await queryRunner.manager.update(Dispute, dispute.id, {
        status: DisputeStatus.REJECTED,
        responseReason,
      });

      // Send email notification
      try {
        await this.emailNotificationService.sendUsingTemplate({
          to: [dispute.email],
          templateKey: TemplateKeys.DISPUTE_REJECTED,
          data: {
            name: `${dispute.firstName} ${dispute.lastName}`,
            reason: responseReason,
          },
        });
      } catch (emailError) {
        // If email fails, rollback the transaction
        await queryRunner.rollbackTransaction();
        throw new CustomException(
          ErrorCode.EMAIL_SEND_FAILED.key,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { email: dispute.email, error: emailError.message }
        );
      }

      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  private async handlePendingStatus(
    dispute: Dispute,
    responseReason: string
  ): Promise<void> {
    // Update dispute status to pending
    await this.disputeRepository.update(dispute.id, {
      status: DisputeStatus.PENDING,
      responseReason,
    });
  }

  private async handleApprovedWithAdminFeesStatus(
    dispute: Dispute,
    responseReason: string
  ): Promise<void> {
    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update dispute status to approved with admin fees
      await queryRunner.manager.update(Dispute, dispute.id, {
        status: DisputeStatus.APPROVED_WITH_ADMIN_FEES,
        responseReason,
      });

      // Send email notification
      try {
        await this.emailNotificationService.sendUsingTemplate({
          to: [dispute.email],
          templateKey: TemplateKeys.DISPUTE_ACCEPTED_WITH_ADMIN_FEES,
          data: {
            name: `${dispute.firstName} ${dispute.lastName}`,
          },
        });
      } catch (emailError) {
        // If email fails, rollback the transaction
        await queryRunner.rollbackTransaction();
        throw new CustomException(
          ErrorCode.EMAIL_SEND_FAILED.key,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { email: dispute.email, error: emailError.message }
        );
      }

      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
