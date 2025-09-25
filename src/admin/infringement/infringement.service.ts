import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
} from "typeorm";
import { Infringement } from "../../infringement/entities/infringement.entity";
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
  InfringementCarParkResponse,
  FindInfringementCarParkRequest,
  FindInfringementReasonRequest,
  InfringementReasonResponse,
} from "./infringement.dto";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { HttpStatus } from "@nestjs/common";
import { InfringementStatus } from "../../common/enums";
import { ApiGetBaseResponse } from "../../common";
import { InfringementPenalty } from "../../infringement/entities/infringement-penalty.entity";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as puppeteer from "puppeteer";
import { InfringementCarPark } from "src/infringement/entities/infringement-car-park.entity";
import { InfringementReason } from "src/infringement/entities/infringement-reason.entity";

@Injectable()
export class InfringementService {
  constructor(
    @InjectRepository(Infringement)
    private infringementRepository: Repository<Infringement>,
    @InjectRepository(InfringementPenalty)
    private infringementPenaltyRepository: Repository<InfringementPenalty>,
    @InjectRepository(InfringementCarPark)
    private infringementCarParkRepository: Repository<InfringementCarPark>,
    @InjectRepository(InfringementReason)
    private infringementReasonRepository: Repository<InfringementReason>
  ) {}

  async scan(
    request: ScanInfringementRequest
  ): Promise<ScanInfringementResponse> {
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

  async create(
    request: CreateInfringementRequest
  ): Promise<CreateInfringementResponse> {
    const {
      id,
      infringementCarParkId,
      carMakeId,
      reasonId,
      penaltyId,
      photos,
      comments,
    } = request;

    // make sure the infringement exists
    const infringement = await this.infringementRepository.findOne({
      where: { id },
    });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // calculate due date = 14 days from now at end of day
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    dueDate.setHours(23, 59, 59, 999);

    // set today's date for ticket
    const ticketDate = new Date();

    // update fields
    infringement.infringementCarParkId = infringementCarParkId;
    infringement.carMakeId = carMakeId;
    infringement.reasonId = reasonId;
    infringement.penaltyId = penaltyId;
    infringement.photos = photos;
    infringement.status = InfringementStatus.NOT_PAID;
    infringement.dueDate = dueDate;
    infringement.ticketDate = ticketDate;
    infringement.comments = comments;

    // save updated record
    const updated = await this.infringementRepository.save(infringement);

    const response = new CreateInfringementResponse();
    response.id = updated.id;
    response.ticketNumber = updated.ticketNumber;
    response.registrationNo = updated.registrationNo;

    return response;
  }

  async update(
    id: string,
    request: UpdateInfringementRequest
  ): Promise<CreateInfringementResponse> {
    const infringement = await this.infringementRepository.findOne({
      where: { id },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const {
      infringementCarParkId,
      carMakeId,
      reasonId,
      penaltyId,
      photos,
      comments,
    } = request;

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

  async findAll(
    request: FindInfringementRequest
  ): Promise<ApiGetBaseResponse<FindInfringementResponse>> {
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

    const [infringements, totalItems] =
      await this.infringementRepository.findAndCount({
        skip,
        take,
        where: whereOptions,
        order: orderOptions,
      });

    const response = infringements.map((infringement) => ({
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
    };
  }

  async findById(id: string): Promise<FindInfringementByIdResponse> {
    const infringement = await this.infringementRepository.findOne({
      where: { id },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
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
    const infringement = await this.infringementRepository.findOne({
      where: { id },
    });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.infringementRepository.softRemove(infringement);
  }

  async markAsWaived(id: string): Promise<MarkAsWaivedResponse> {
    const infringement = await this.infringementRepository.exists({
      where: { id },
    });
    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.infringementRepository.update(id, {
      status: InfringementStatus.WAIVED,
    });

    const response = new MarkAsWaivedResponse();
    response.id = id;
    response.status = InfringementStatus.WAIVED;

    return response;
  }

  async getInfringementId(request: GetTicketNumberRequest): Promise<string> {
    const infringement = await this.infringementRepository.findOne({
      where: {
        ticketNumber: request.ticketNumber,
        registrationNo: request.registrationNo,
      },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    return infringement.id;
  }

  async getPenalty(
    infringementCarParkId: string
  ): Promise<GetPenaltyResponse[]> {
    return await this.infringementPenaltyRepository.find({
      where: {
        infringementCarParkId: infringementCarParkId,
      },
    });
  }

  async updateStatus(
    id: string,
    request: UpdateInfringementStatusRequest
  ): Promise<UpdateInfringementStatusResponse> {
    const infringement = await this.infringementRepository.findOne({
      where: { id },
    });

    if (!infringement) {
      throw new CustomException(
        ErrorCode.INFRINGEMENT_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const { status } = request;

    await this.infringementRepository.update(id, { status });

    const response = new UpdateInfringementStatusResponse();
    response.id = id;
    response.status = status;

    return response;
  }

  async findAllInfringementCarPark(
    request: FindInfringementCarParkRequest
  ): Promise<ApiGetBaseResponse<InfringementCarParkResponse>> {
    const { pageNo, pageSize, sortField, sortOrder, search } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<InfringementCarPark> = {};
    const orderOptions: FindOptionsOrder<InfringementCarPark> = {};

    if (search) {
      whereOptions.carParkName = ILike(`%${search}%`);
    }

    const [infringementCarPark, totalItems] =
      await this.infringementCarParkRepository.findAndCount({
        where: whereOptions,
        skip,
        take,
        order: orderOptions,
      });

    const response = infringementCarPark.map((infringementCarPark) => ({
      id: infringementCarPark.id,
      carParkName: infringementCarPark.carParkName,
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

  async findAllInfringementReason(
    request: FindInfringementReasonRequest
  ): Promise<ApiGetBaseResponse<InfringementReasonResponse>> {
    const { pageNo, pageSize, sortField, sortOrder, search } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<InfringementReason> = {};
    const orderOptions: FindOptionsOrder<InfringementReason> = {};

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    if (search) {
      whereOptions.reason = ILike(`%${search}%`);
    }

    const [infringementReason, totalItems] =
      await this.infringementReasonRepository.findAndCount({
        where: whereOptions,
        skip,
        take,
        order: orderOptions,
      });

    const response = infringementReason.map((infringementReason) => ({
      id: infringementReason.id,
      reason: infringementReason.reason,
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
        HttpStatus.BAD_REQUEST
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
    response.carMakeName = infringement.carMake?.carMakeName || "";
    response.carParkName = infringement.infringementCarPark?.carParkName || "";
    response.reasonName = infringement.reason?.reason || "";
    response.penaltyName = infringement.penalty?.penaltyName || "";
    response.amountBeforeDue = infringement.penalty?.amountBeforeDue || 0;
    response.amountAfterDue = infringement.penalty?.amountAfterDue || 0;

    return response;
  }

  async generateTicketPng(ticketNumber: number): Promise<Buffer> {
    try {
      // Get ticket data using existing method
      const ticketData = await this.getTicket({ ticketNumber });

      // Load and compile Handlebars template
      const templatePath = path.join(
        process.cwd(),
        "assets",
        "templates",
        "html",
        "ticket.template.hbs"
      );

      console.log("Template path:", templatePath);

      if (!fs.existsSync(templatePath)) {
        console.error("Template file not found at:", templatePath);
        throw new CustomException(
          ErrorCode.INFRINGEMENT_NOT_FOUND.key,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const templateContent = fs.readFileSync(templatePath, "utf-8");
      const template = handlebars.compile(templateContent);

      // Prepare data for template
      const templateData = {
        ticketNumber: ticketData.ticketNumber,
        ticketDate: ticketData.ticketDate
          ? new Date(ticketData.ticketDate).toLocaleString()
          : "N/A",
        ticketTime: ticketData.ticketDate
          ? new Date(ticketData.ticketDate).toLocaleTimeString()
          : "N/A",
        carParkName: ticketData.carParkName || "N/A",
        registrationNo: ticketData.registrationNo || "N/A",
        carMakeName: ticketData.carMakeName || "N/A",
        reasonName: ticketData.reasonName || "N/A",
        penaltyName: ticketData.penaltyName || "N/A",
        comments: ticketData.comments || "",
        amountBeforeDue: ticketData.amountBeforeDue || 0,
        amountAfterDue: ticketData.amountAfterDue || 0,
        dueDate: ticketData.dueDate
          ? new Date(ticketData.dueDate).toLocaleDateString()
          : "N/A",
      };

      console.log("Template data:", templateData);

      // Render HTML
      const html = template(templateData);
      console.log("Generated HTML length:", html.length);

      // Configure Puppeteer for cross-platform compatibility
      const puppeteerConfig: any = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
        ],
      };

      // On macOS, use Puppeteer's bundled Chrome or system Chrome
      if (process.platform === "darwin") {
        const puppeteerChrome = path.join(
          os.homedir(),
          ".cache/puppeteer/chrome/mac_arm-140.0.7339.185/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
        );

        const possiblePaths = [
          puppeteerChrome,
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ];

        for (const chromePath of possiblePaths) {
          if (fs.existsSync(chromePath)) {
            puppeteerConfig.executablePath = chromePath;
            console.log("Using Chrome at:", chromePath);
            break;
          }
        }
      }

      console.log("Launching Puppeteer with config:", puppeteerConfig);

      // Launch Puppeteer and generate PNG
      const browser = await puppeteer.launch(puppeteerConfig);

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 400,
        height: 600,
        deviceScaleFactor: 2,
      });

      // Generate PNG buffer
      const pngBuffer = await page.screenshot({
        type: "png",
        fullPage: true,
        omitBackground: false,
      });

      await browser.close();

      console.log("PNG buffer generated, size:", pngBuffer.length);
      return pngBuffer as Buffer;
    } catch (error) {
      console.error("Error in generateTicketPng:", error);

      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
