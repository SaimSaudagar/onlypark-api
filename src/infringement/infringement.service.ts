import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Infringement } from "./entities/infringement.entity";
import {
  GetInfringementPaymentRequest,
  GetInfringementPaymentResponse,
} from "./infringement.dto";
import { CustomException } from "../common/exceptions/custom.exception";
import { ErrorCode } from "../common/exceptions/error-code";
import { HttpStatus } from "@nestjs/common";
import { InfringementStatus } from "../common/enums";

@Injectable()
export class InfringementService {
  constructor(
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>
  ) {}

  async getInfringementPayment(
    request: GetInfringementPaymentRequest
  ): Promise<GetInfringementPaymentResponse> {
    const { ticketNumber, registrationNumber } = request;

    const infringement = await this.infringementRepository.findOne({
      where: { ticketNumber, registrationNumber },
      relations: {
        infringementCarPark: true,
        reason: true,
        penalty: true,
        carMake: true,
      },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Format date and time from ticketDate
    const ticketDate = new Date(infringement.ticketDate);
    const date = ticketDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = ticketDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Format due date
    const dueDate = new Date(infringement.dueDate);
    const formattedDueDate = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Determine amount based on current date vs due date
    const currentDate = new Date();
    const isOverdue = currentDate > dueDate;
    const amount = isOverdue
      ? infringement.penalty?.amountAfterDue || 0
      : infringement.penalty?.amountBeforeDue || 0;
    const status = infringement.status;

    const response = new GetInfringementPaymentResponse();
    response.ticketNumber = infringement.ticketNumber;
    response.registration = infringement.registrationNumber;
    response.carMake = infringement.carMake?.carMakeName || "";
    response.date = date;
    response.time = time;
    response.amount = amount;
    response.status = status;
    response.dueDate = formattedDueDate;
    response.reason = infringement.reason?.reason || "";
    response.photos = infringement.photos || {};
    response.stripePriceId = infringement.penalty?.stripePriceIdBeforeDue || "";
    return response;
  }

  async findInfringementForPayment(
    registrationNumber: string,
    ticketNumber: number
  ): Promise<Infringement | null> {
    return await this.infringementRepository.findOne({
      where: {
        registrationNumber,
        ticketNumber,
      },
      relations: {
        infringementCarPark: true,
        reason: true,
        penalty: true,
        carMake: true,
      },
    });
  }

  async updatePaymentStatus(
    registrationNumber: string,
    ticketNumber: number,
    status: InfringementStatus
  ): Promise<void> {
    const result = await this.infringementRepository.update(
      {
        registrationNumber,
        ticketNumber,
        status: InfringementStatus.NOT_PAID, // Only update if not already paid
      },
      { status }
    );

    if (result.affected === 0) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.NOT_FOUND
      );
    }
  }
}
