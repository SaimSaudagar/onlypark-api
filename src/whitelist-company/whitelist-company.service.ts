import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindOneOptions,
  Repository,
  QueryRunner,
  FindOptionsWhere,
  ILike,
  FindOptionsOrder,
} from "typeorm";
import { WhitelistCompany } from "./entities/whitelist-company.entity";
import {
  CreateWhitelistCompanyDto,
  CreateWhitelistCompanyResponse,
  FindWhitelistCompanyRequest,
  FindWhitelistCompanyResponse,
  UpdateWhitelistCompanyDto,
} from "./whitelist-company.dto";
import { ApiGetBaseResponse, CustomException, ErrorCode } from "../common";

@Injectable()
export class WhitelistCompanyService {
  constructor(
    @InjectRepository(WhitelistCompany)
    private whitelistCompanyRepository: Repository<WhitelistCompany>,
  ) {}

  async create(
    createDto: CreateWhitelistCompanyDto,
  ): Promise<WhitelistCompany> {
    try {
      const existingCompany = await this.whitelistCompanyRepository.findOne({
        where: {
          domainName: createDto.domainName,
          subCarParkId: createDto.subCarParkId,
        },
      });

      if (existingCompany) {
        throw new CustomException(
          ErrorCode.WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      const entity = this.whitelistCompanyRepository.create(createDto);
      const savedEntity = await this.whitelistCompanyRepository.create(entity);
      return savedEntity;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ErrorCode.CLIENT_ERROR.key,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    request: FindWhitelistCompanyRequest,
  ): Promise<ApiGetBaseResponse<FindWhitelistCompanyResponse>> {
    const {
      companyName,
      domainName,
      pageNo,
      pageSize,
      sortField,
      sortOrder,
      search,
    } = request;
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const whereOptions: FindOptionsWhere<WhitelistCompany>[] = [];
    const orderOptions: FindOptionsOrder<WhitelistCompany> = {};

    if (companyName) {
      whereOptions.push({ companyName: ILike(`%${companyName}%`) });
    }

    if (domainName) {
      whereOptions.push({ domainName: ILike(`%${domainName}%`) });
    }

    if (search) {
      whereOptions.push(
        { companyName: ILike(`%${search}%`) },
        { domainName: ILike(`%${search}%`) },
      );
    }

    if (sortField) {
      orderOptions[sortField] = sortOrder;
    }

    const [whitelistCompanies, totalItems] =
      await this.whitelistCompanyRepository.findAndCount({
        relations: {
          subCarPark: true,
        },
        skip,
        take,
        order: orderOptions,
        where: whereOptions,
      });

    const response = whitelistCompanies.map((whitelistCompany) => ({
      id: whitelistCompany.id,
      companyName: whitelistCompany.companyName,
      domainName: whitelistCompany.domainName,
      subCarParkId: whitelistCompany.subCarParkId,
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

  async findOne(
    options?: FindOneOptions<WhitelistCompany>,
  ): Promise<WhitelistCompany> {
    try {
      const company = await this.whitelistCompanyRepository.findOne({
        ...options,
        relations: {
          subCarPark: true,
        },
      });

      if (!company) {
        throw new CustomException(
          ErrorCode.WHITELIST_COMPANY_NOT_FOUND.key,
          HttpStatus.NOT_FOUND,
        );
      }

      return company;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateDto: UpdateWhitelistCompanyDto,
  ): Promise<WhitelistCompany> {
    try {
      const entity = await this.whitelistCompanyRepository.findOne({
        where: { id },
        relations: ["subCarPark", "tenancy"],
      });

      if (!entity) {
        throw new CustomException(
          ErrorCode.WHITELIST_COMPANY_NOT_FOUND.key,
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if email is being updated and if it already exists
      if (updateDto.domainName && updateDto.domainName !== entity.domainName) {
        const existingCompany = await this.whitelistCompanyRepository.findOne({
          where: {
            domainName: updateDto.domainName,
            subCarParkId: updateDto.subCarParkId || entity.subCarParkId,
          },
        });

        if (existingCompany && existingCompany.id !== id) {
          throw new CustomException(
            ErrorCode.WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS.key,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      Object.assign(entity, updateDto);
      const updatedEntity =
        await this.whitelistCompanyRepository.create(entity);
      return updatedEntity;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const entity = await this.whitelistCompanyRepository.findOne({
        where: { id },
      });

      if (!entity) {
        throw new CustomException(
          ErrorCode.WHITELIST_COMPANY_NOT_FOUND.key,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.whitelistCompanyRepository.remove(entity);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findBySubCarPark(subCarParkId: string): Promise<WhitelistCompany[]> {
    try {
      return await this.whitelistCompanyRepository.find({
        where: { subCarParkId },
        relations: ["subCarPark", "tenancy"],
      });
    } catch (error) {
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async toggleActiveStatus(id: string): Promise<WhitelistCompany> {
    try {
      const entity = await this.whitelistCompanyRepository.findOne({
        where: { id },
        relations: ["subCarPark", "tenancy"],
      });

      if (!entity) {
        throw new CustomException(
          ErrorCode.WHITELIST_COMPANY_NOT_FOUND.key,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedEntity =
        await this.whitelistCompanyRepository.create(entity);
      return updatedEntity;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ErrorCode.SERVER_ERROR.key,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkDomainNameExists(
    domainName: string,
    subCarParkId: string,
  ): Promise<boolean> {
    const existingCompany = await this.whitelistCompanyRepository.findOne({
      where: {
        domainName: domainName,
        subCarParkId: subCarParkId,
      },
    });

    return !!existingCompany;
  }

  async createBulk(
    request: CreateWhitelistCompanyDto[],
    queryRunner: QueryRunner,
  ): Promise<CreateWhitelistCompanyResponse[]> {
    const createdWhitelistCompanies: CreateWhitelistCompanyResponse[] = [];

    for (const company of request) {
      const emailExists = await this.checkDomainNameExists(
        company.domainName,
        company.subCarParkId,
      );

      if (emailExists) {
        throw new CustomException(
          ErrorCode.WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS.key,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create whitelist company using query builder
      const result = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(WhitelistCompany)
        .values({
          companyName: company.companyName,
          domainName: company.domainName,
          subCarParkId: company.subCarParkId,
        })
        .returning("*")
        .execute();

      const savedWhitelistCompany = result.raw[0];
      createdWhitelistCompanies.push(savedWhitelistCompany);
    }

    return createdWhitelistCompanies.map((company) => ({
      id: company.id,
      companyName: company.companyName,
      domainName: company.domainName,
      subCarParkId: company.subCarParkId,
    }));
  }
}
