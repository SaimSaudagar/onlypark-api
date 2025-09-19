import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Infringement } from '../../infringement/entities/infringement.entity';
import {
  CreateInfringementRequest,
  CreateInfringementResponse,
  FindInfringementByIdResponse,
  FindInfringementRequest,
  FindInfringementResponse,
  GetPenaltyResponse,
  GetTicketNumberRequest,
  GetTicketResponse,
  GetTicketRequest,
  MarkAsWaivedResponse,
  ScanInfringementRequest,
  ScanInfringementResponse,
  UpdateInfringementRequest,
  UpdateInfringementStatusRequest,
  UpdateInfringementStatusResponse,
} from './infringement.dto';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { HttpStatus } from '@nestjs/common';
import { InfringementStatus } from '../../common/enums';
import { ApiGetBaseResponse } from '../../common';
import { InfringementPenalty } from '../../infringement/entities/infringement-penalty.entity';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

@Injectable()
export class InfringementService {
  constructor(
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>,
    @InjectRepository(InfringementPenalty)
    private infringementPenaltyRepository: Repository<InfringementPenalty>,
  ) { }

  async scan(request: ScanInfringementRequest): Promise<ScanInfringementResponse> {
    const { registrationNo } = request;

    const infringement = await this.infringementRepository.save({
      registrationNo,
    });

    const response = new ScanInfringementResponse();
    response.id = infringement.id;
    response.ticketNumber = infringement.ticketNumber;
    response.registrationNo = infringement.registrationNo;

    return response;
  }

  async create(request: CreateInfringementRequest): Promise<CreateInfringementResponse> {
    const { infringementCarParkId, carMakeId, reasonId, penaltyId, photos, comments } = request;
    // Calculate due date as 14 days from now at end of day
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    dueDate.setHours(23, 59, 59, 999); // Set to end of day

    const infringement = await this.infringementRepository.save({
      infringementCarParkId,
      carMakeId,
      reasonId,
      penaltyId,
      photos,
      status: InfringementStatus.PENDING,
      dueDate,
      comments,
    });

    const response = new CreateInfringementResponse();
    response.id = infringement.id;
    response.ticketNumber = infringement.ticketNumber;
    response.registrationNo = infringement.registrationNo;

    return response;
  }

  async update(id: string, request: UpdateInfringementRequest): Promise<CreateInfringementResponse> {
    const infringement = await this.infringementRepository.findOne({
      where: { id },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { infringementCarParkId, carMakeId, reasonId, penaltyId, photos, comments } = request;

    // Update the infringement with new data
    await this.infringementRepository.update(id, {
      infringementCarParkId,
      carMakeId,
      reasonId,
      penaltyId,
      photos,
      comments,
    });

    // Fetch the updated infringement
    const updatedInfringement = await this.infringementRepository.findOne({
      where: { id },
    });

    const response = new CreateInfringementResponse();
    response.id = updatedInfringement.id;
    response.ticketNumber = updatedInfringement.ticketNumber;
    response.registrationNo = updatedInfringement.registrationNo;

    return response;
  }

  async findAll(request: FindInfringementRequest): Promise<ApiGetBaseResponse<FindInfringementResponse>> {
    const { search, status, sortField, sortOrder, pageNo, pageSize } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<Infringement> = {};
    const orderOptions: FindOptionsOrder<Infringement> = {};

    if (search) {
      whereOptions.registrationNo = ILike(`%${search}%`);
    }

    if (status) {
      whereOptions.status = status;
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
      where: { id },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = new FindInfringementByIdResponse();
    response.id = infringement.id;
    response.ticketNumber = infringement.ticketNumber;
    response.registrationNo = infringement.registrationNo;
    response.status = infringement.status;
    response.ticketDate = infringement.ticketDate;

    return response;
  }

  async remove(id: string) {
    const infringement = await this.infringementRepository.findOne({ where: { id } });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.infringementRepository.softRemove(infringement);
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

    const response = new MarkAsWaivedResponse();
    response.id = id;
    response.status = InfringementStatus.WAIVED;

    return response;
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

  async getPenalty(infringementCarParkId: string): Promise<GetPenaltyResponse[]> {
    return await this.infringementPenaltyRepository.find({
      where: {
        infringementCarParkId: infringementCarParkId,
      },
    });
  }

  async updateStatus(id: string, request: UpdateInfringementStatusRequest): Promise<UpdateInfringementStatusResponse> {
    const infringement = await this.infringementRepository.findOne({
      where: { id },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { status } = request;

    await this.infringementRepository.update(id, { status });

    const response = new UpdateInfringementStatusResponse();
    response.id = id;
    response.status = status;

    return response;
  }

  async getTicket(request: GetTicketRequest): Promise<GetTicketResponse> {
    const { ticketNumber } = request;

    const infringement = await this.infringementRepository.findOne({
      where: { ticketNumber },
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
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = new GetTicketResponse();
    response.id = infringement.id;
    response.ticketNumber = infringement.ticketNumber;
    response.ticketDate = infringement.ticketDate;
    response.registrationNo = infringement.registrationNo;
    response.status = infringement.status;
    response.dueDate = infringement.dueDate;
    response.comments = infringement.comments;
    response.photos = infringement.photos;
    response.carMakeName = infringement.carMake?.carMakeName || '';
    response.carParkName = infringement.infringementCarPark?.carParkName || '';
    response.reasonName = infringement.reason?.reason || '';
    response.penaltyName = infringement.penalty?.penaltyName || '';
    response.amountBeforeDue = infringement.penalty?.amountBeforeDue || 0;
    response.amountAfterDue = infringement.penalty?.amountAfterDue || 0;

    return response;
  }

  async generateTicketPng(ticketNumber: number): Promise<Buffer> {
    try {
      // Get ticket data using existing method
      const ticketData = await this.getTicket({ ticketNumber });

      // Load and compile Handlebars template
      const templatePath = path.join(process.cwd(), 'assets', 'templates', 'html', 'ticket.template.hbs');
      
      if (!fs.existsSync(templatePath)) {
        throw new CustomException(
          ErrorCode.INFRINGEMENT_NOT_FOUND.key,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);

      // Prepare data for template
      const templateData = {
        ticketNumber: ticketData.ticketNumber,
        ticketDate: ticketData.ticketDate ? new Date(ticketData.ticketDate).toLocaleString() : 'N/A',
        carParkName: ticketData.carParkName || 'N/A',
        registrationNo: ticketData.registrationNo || 'N/A',
        carMakeName: ticketData.carMakeName || 'N/A',
        reasonName: ticketData.reasonName || 'N/A',
        penaltyName: ticketData.penaltyName || 'N/A',
        comments: ticketData.comments || '',
        amountBeforeDue: ticketData.amountBeforeDue || 0,
        amountAfterDue: ticketData.amountAfterDue || 0,
        dueDate: ticketData.dueDate ? new Date(ticketData.dueDate).toLocaleDateString() : 'N/A',
      };

      // Render HTML
      const html = template(templateData);

      // Launch Puppeteer and generate PNG
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 400,
        height: 600,
        deviceScaleFactor: 2
      });

      // Generate PNG buffer
      const pngBuffer = await page.screenshot({
        type: 'png',
        fullPage: true,
        omitBackground: false
      });

      await browser.close();

      return pngBuffer as Buffer;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
