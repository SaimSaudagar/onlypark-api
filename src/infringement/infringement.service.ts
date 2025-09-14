import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Infringement } from './entities/infringement.entity';
import {
  CreateInfringementRequest,
  CreateInfringementResponse,
  FindInfringementByIdResponse,
  FindInfringementRequest,
  FindInfringementResponse,
  GetTicketNumberRequest,
  MarkAsWaivedResponse,
  ScanInfringementRequest,
  ScanInfringementResponse,
  UpdateInfringementRequest,
} from './infringement.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { ErrorCode } from '../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { InfringementStatus } from 'src/common/enums';
import { ApiGetBaseResponse } from 'src/common';

@Injectable()
export class InfringementService {
  constructor(
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>,
  ) { }

  async scan(request: ScanInfringementRequest): Promise<ScanInfringementResponse> {
    const { registrationNo } = request;

    const infringement = await this.infringementRepository.save({
      registrationNo,
    });

    return { id: infringement.id, ticketNumber: infringement.ticketNumber, registrationNo };
  }

  async create(request: CreateInfringementRequest | UpdateInfringementRequest): Promise<CreateInfringementResponse> {
    const { id, carParkName, carMakeId, reasonId, penaltyId, photos, comments } = request;
    // Calculate due date as 14 days from now at end of day
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    dueDate.setHours(23, 59, 59, 999); // Set to end of day

    if (id) {
      const existingInfringement = await this.infringementRepository.findOne({
        where: { id }
      });

      if (!existingInfringement) {
        throw new CustomException(
          ErrorCode.INFRINGEMENT_NOT_FOUND.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      Object.assign(existingInfringement, {
        carParkName,
        carMakeId,
        reasonId,
        penaltyId,
        photos,
        status: InfringementStatus.PENDING,
        dueDate,
        comments,
      });

      const updatedInfringement = await this.infringementRepository.save(existingInfringement);
      return {
        id: updatedInfringement.id,
        ticketNumber: updatedInfringement.ticketNumber,
        registrationNo: updatedInfringement.registrationNo,
      };
    }



    const infringement = await this.infringementRepository.save({
      carParkName,
      carMakeId,
      reasonId,
      penaltyId,
      photos,
      status: InfringementStatus.PENDING,
      dueDate,
      comments,
    });

    return { id: infringement.id, ticketNumber: infringement.ticketNumber, registrationNo: infringement.registrationNo };
  }

  async findAll(request: FindInfringementRequest): Promise<ApiGetBaseResponse<FindInfringementResponse>> {
    const { search, sortField, sortOrder, pageNo, pageSize } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<Infringement> = {};
    const orderOptions: FindOptionsOrder<Infringement> = {};

    if (search) {
      whereOptions.registrationNo = ILike(`%${search}%`);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const [infringements, totalItems] = await this.infringementRepository.findAndCount({
      skip,
      take,
      where: whereOptions,
      order: orderOptions,
    });

    const response = infringements.map(infringement => ({
      id: infringement.id,
      ticketNumber: infringement.ticketNumber,
      registrationNo: infringement.registrationNo,
      status: infringement.status,
      ticketDate: infringement.ticketDate,
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

  async findById(id: string): Promise<FindInfringementByIdResponse> {
    const infringement = await this.infringementRepository.findOne({
      where: { ticketNumber: Number(id) },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    return infringement;
  }

  async remove(id: string) {
    const infringement = this.infringementRepository.findOne({ where: { ticketNumber: Number(id) } });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.infringementRepository.delete(id);
  }

  async markAsWaived(id: string): Promise<MarkAsWaivedResponse> {
    const infringement = await this.infringementRepository.exists({ where: { id } });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.infringementRepository.update(id, { status: InfringementStatus.WAIVED });

    return {
      id,
      status: InfringementStatus.WAIVED,
    };
  }

  async getInfringementId(request: GetTicketNumberRequest): Promise<string> {
    const infringement = await this.infringementRepository.findOne({ where: { ticketNumber: request.ticketNumber, registrationNo: request.registrationNo } });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    return infringement.id;
  }
}
