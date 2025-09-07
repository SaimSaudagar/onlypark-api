import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository, QueryRunner } from 'typeorm';
import { WhitelistCompany } from './entities/whitelist-company.entity';
import { CreateWhitelistCompanyDto, UpdateWhitelistCompanyDto } from './whitelist-company.dto';
import { CustomException, ErrorCode } from '../common';

@Injectable()
export class WhitelistCompanyService {
    constructor(
        @InjectRepository(WhitelistCompany)
        private whitelistCompanyRepository: Repository<WhitelistCompany>,
    ) { }

    async create(createDto: CreateWhitelistCompanyDto): Promise<WhitelistCompany> {
        try {
            // Check if company with same email already exists
            const existingCompany = await this.whitelistCompanyRepository.findOne({
                where: { email: createDto.email, subCarParkId: createDto.subCarParkId }
            });

            if (existingCompany) {
                throw new CustomException(
                    ErrorCode.WHITELIST_COMPANY_EMAIL_ALREADY_EXISTS.key,
                    HttpStatus.BAD_REQUEST,
                );
            }

            const entity = this.whitelistCompanyRepository.create(createDto);
            const savedEntity = await this.whitelistCompanyRepository.save(entity);
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

    async findAll(options?: FindManyOptions<WhitelistCompany>): Promise<WhitelistCompany[]> {
        try {
            return await this.whitelistCompanyRepository.find({
                ...options,
                relations: ['subCarPark', 'tenancy'],
            });
        } catch (error) {
            throw new CustomException(
                ErrorCode.SERVER_ERROR.key,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(options?: FindOneOptions<WhitelistCompany>): Promise<WhitelistCompany> {
        try {
            const company = await this.whitelistCompanyRepository.findOne({
                ...options,
                relations: ['subCarPark', 'tenancy'],
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

    async update(id: string, updateDto: UpdateWhitelistCompanyDto): Promise<WhitelistCompany> {
        try {
            const entity = await this.whitelistCompanyRepository.findOne({
                where: { id },
                relations: ['subCarPark', 'tenancy']
            });

            if (!entity) {
                throw new CustomException(
                    ErrorCode.WHITELIST_COMPANY_NOT_FOUND.key,
                    HttpStatus.NOT_FOUND,
                );
            }

            // Check if email is being updated and if it already exists
            if (updateDto.email && updateDto.email !== entity.email) {
                const existingCompany = await this.whitelistCompanyRepository.findOne({
                    where: {
                        email: updateDto.email,
                        subCarParkId: updateDto.subCarParkId || entity.subCarParkId
                    }
                });

                if (existingCompany && existingCompany.id !== id) {
                    throw new CustomException(
                        ErrorCode.WHITELIST_COMPANY_EMAIL_ALREADY_EXISTS.key,
                        HttpStatus.BAD_REQUEST,
                    );
                }
            }

            Object.assign(entity, updateDto);
            const updatedEntity = await this.whitelistCompanyRepository.save(entity);
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
            const entity = await this.whitelistCompanyRepository.findOne({ where: { id } });

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
                relations: ['subCarPark', 'tenancy'],
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
                relations: ['subCarPark', 'tenancy']
            });

            if (!entity) {
                throw new CustomException(
                    ErrorCode.WHITELIST_COMPANY_NOT_FOUND.key,
                    HttpStatus.NOT_FOUND,
                );
            }

            const updatedEntity = await this.whitelistCompanyRepository.save(entity);
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

    async checkEmailExists(email: string, subCarParkId: string): Promise<boolean> {
        const existingCompany = await this.whitelistCompanyRepository.findOne({
            where: {
                email: email,
                subCarParkId: subCarParkId
            }
        });

        return !!existingCompany;
    }

    async createBulkWithTransaction(companies: any[], subCarParkId: string, queryRunner: QueryRunner): Promise<WhitelistCompany[]> {
        const createdCompanies: WhitelistCompany[] = [];

        for (const company of companies) {
            const emailExists = await this.checkEmailExists(company.email, subCarParkId);

            if (emailExists) {
                throw new CustomException(
                    ErrorCode.WHITELIST_COMPANY_EMAIL_ALREADY_EXISTS.key,
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
                    email: company.email,
                    subCarParkId: subCarParkId,
                })
                .returning('*')
                .execute();

            const savedWhitelistCompany = result.raw[0] as WhitelistCompany;
            createdCompanies.push(savedWhitelistCompany);
        }

        return createdCompanies;
    }
}
