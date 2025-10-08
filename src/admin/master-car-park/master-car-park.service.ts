import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindManyOptions,
  Repository,
  ILike,
  FindOptionsOrder,
  FindOptionsWhere,
  DataSource,
} from "typeorm";
import { MasterCarPark } from "../../master-car-park/entities/master-car-park.entity";
import {
  CreateMasterCarParkRequest,
  UpdateMasterCarParkRequest,
  CreateMasterCarParkResponse,
  FindMasterCarParkRequest,
  FindMasterCarParkResponse,
  UpdateMasterCarParkStatusRequest,
  UpdateMasterCarParkStatusResponse,
  FindMasterCarParkByIdResponse,
  UpdateMasterCarParkResponse,
} from "./master-car-park.dto";
import * as crypto from "crypto";
import { ParkingSpotStatus } from "../../common/enums";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { HttpStatus } from "@nestjs/common";
import { ApiGetBaseResponse } from "../../common/types";
import { BaseService } from "../../common/base.service";
import { ConfigService } from "@nestjs/config";
import { RequestContextService } from "../../common/services/request-context/request-context.service";

@Injectable()
export class MasterCarParkService extends BaseService {
  constructor(
    @InjectRepository(MasterCarPark)
    private masterCarParkRepository: Repository<MasterCarPark>,
    requestContextService: RequestContextService,
    configService: ConfigService,
    datasource: DataSource
  ) {
    super(
      requestContextService,
      configService,
      datasource,
      MasterCarParkService.name
    );
  }

  async create(
    masterCarParkDto: CreateMasterCarParkRequest
  ): Promise<CreateMasterCarParkResponse> {
    const { carParkName, carParkType } = masterCarParkDto;

    const masterCarParkCode = await this.generateMasterCarParkCode();

    const carParkNameInDb = await this.masterCarParkRepository.findOne({
      where: { carParkName },
    });
    if (carParkNameInDb) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NAME_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const masterCarPark = await this.masterCarParkRepository.save({
      carParkName,
      carParkType,
      masterCarParkCode,
      status: ParkingSpotStatus.ACTIVE,
    });

    const response = new CreateMasterCarParkResponse();
    response.id = masterCarPark.id;
    response.carParkName = masterCarPark.carParkName;
    response.carParkType = masterCarPark.carParkType;
    response.masterCarParkCode = masterCarPark.masterCarParkCode;
    response.status = masterCarPark.status;

    return response;
  }

  async findAll(
    request: FindMasterCarParkRequest
  ): Promise<ApiGetBaseResponse<FindMasterCarParkResponse>> {
    const {
      pageNo,
      pageSize,
      sortField,
      sortOrder,
      search,
      carParkType,
      status,
    } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<MasterCarPark> = {};
    const orderOptions: FindOptionsOrder<MasterCarPark> = {};

    if (search) {
      whereOptions.carParkName = ILike(`%${search}%`);
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    if (carParkType) {
      whereOptions.carParkType = carParkType;
    }

    if (status) {
      whereOptions.status = status;
    }

    const query: FindManyOptions<MasterCarPark> = {
      where: whereOptions,
      order: orderOptions,
      relations: {
        subCarParks: true,
      },
      skip,
      take,
    };

    const [masterCarParks, totalItems] =
      await this.masterCarParkRepository.findAndCount(query);

    const response: FindMasterCarParkResponse[] = masterCarParks.map(
      (masterCarPark) => ({
        id: masterCarPark.id,
        carParkName: masterCarPark.carParkName,
        carParkType: masterCarPark.carParkType,
        carParkCode: masterCarPark.masterCarParkCode,
        status: masterCarPark.status,
        subCarParks: masterCarPark.subCarParks?.map((subCarPark) => ({
          id: subCarPark.id,
          carParkName: subCarPark.carParkName,
          carSpace: subCarPark.carSpace,
          status: subCarPark.status,
        })),
      })
    );

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

  async findById(id: string): Promise<FindMasterCarParkByIdResponse> {
    const masterCarPark = await this.masterCarParkRepository.findOne({
      where: { id },
      relations: { subCarParks: true },
    });
    if (!masterCarPark) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    return {
      id: masterCarPark.id,
      carParkName: masterCarPark.carParkName,
      carParkCode: masterCarPark.masterCarParkCode,
      carParkType: masterCarPark.carParkType,
      status: masterCarPark.status,
      subCarParks: masterCarPark.subCarParks?.map((subCarPark) => ({
        id: subCarPark.id,
        carParkName: subCarPark.carParkName,
        carSpace: subCarPark.carSpace,
        status: subCarPark.status,
      })),
    };
  }

  async exists(id: string): Promise<boolean> {
    const masterCarPark = await this.masterCarParkRepository.exists({
      where: { id },
    });
    return masterCarPark;
  }

  async update(
    id: string,
    request: UpdateMasterCarParkRequest
  ): Promise<UpdateMasterCarParkResponse> {
    const { carParkName, carParkType } = request;
    const masterCarParkExists = await this.masterCarParkRepository.exists({
      where: { id },
    });
    if (!masterCarParkExists) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const masterCarParkNameInDb = await this.masterCarParkRepository.exists({
      where: { carParkName },
    });
    if (masterCarParkNameInDb) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NAME_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const masterCarPark = await this.masterCarParkRepository.findOne({
      where: { id },
    });
    masterCarPark.carParkName = carParkName;
    masterCarPark.carParkType = carParkType;
    await this.masterCarParkRepository.save(masterCarPark);

    return {
      id: masterCarPark.id,
      carParkName: masterCarPark.carParkName,
      carParkType: masterCarPark.carParkType,
      masterCarParkCode: masterCarPark.masterCarParkCode,
      status: masterCarPark.status,
    };
  }

  async remove(id: string) {
    const masterCarPark = await this.masterCarParkRepository.findOne({
      where: { id },
      relations: {
        subCarParks: true,
      },
    });

    if (!masterCarPark) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    if (masterCarPark.subCarParks && masterCarPark.subCarParks.length > 0) {
      throw new CustomException(
        ErrorCode.CANNOT_DELETE_MASTER_CAR_PARK_WITH_SUB_CAR_PARKS.key,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.masterCarParkRepository.remove(masterCarPark);
  }

  async updateStatus(
    id: string,
    request: UpdateMasterCarParkStatusRequest
  ): Promise<UpdateMasterCarParkStatusResponse> {
    const { status } = request;
    const masterCarPark = await this.masterCarParkRepository.findOne({
      where: { id },
      relations: { subCarParks: true },
    });
    if (!masterCarPark) {
      throw new CustomException(
        ErrorCode.MASTER_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST
      );
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update master car park status
      masterCarPark.status = status;
      await queryRunner.manager.save(masterCarPark);

      // Update all sub-car parks status
      if (masterCarPark.subCarParks && masterCarPark.subCarParks.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .update("sub_car_park")
          .set({ status })
          .where("masterCarParkId = :masterCarParkId", { masterCarParkId: id })
          .execute();
      }

      await queryRunner.commitTransaction();

      return {
        id: masterCarPark.id,
        status: masterCarPark.status,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateMasterCarParkCode(): Promise<string> {
    const prefix = "MC";
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();

    const carParkCodeInDb = await this.masterCarParkRepository.findOne({
      where: { masterCarParkCode: `${prefix}${randomSuffix}` },
    });
    if (carParkCodeInDb) {
      return this.generateMasterCarParkCode();
    }

    return `${prefix}${randomSuffix}`;
  }
}
