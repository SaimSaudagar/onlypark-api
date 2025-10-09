import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Whitelist } from "./entities/whitelist.entity";
import {
  CreateSelfServeWhitelistRequest,
  CreateSelfServeWhitelistResponse,
  GetWhitelistByTokenResponse,
} from "./whitelist.dto";
import { ErrorCode } from "../common/exceptions/error-code";
import { CustomException } from "../common/exceptions/custom.exception";
import { SubCarPark } from "../sub-car-park/entities/sub-car-park.entity";
import { Tenancy } from "../tenancy/entities/tenancy.entity";
import { WhitelistStatus, WhitelistType } from "../common/enums";
import { EmailNotificationService } from "../common/services/email/email-notification.service";
import { TemplateKeys } from "../common/constants/template-keys";
import * as crypto from "crypto";
import { Blacklist } from "../blacklist/entities/blacklist-reg.entity";

@Injectable()
export class WhitelistService {
  constructor(
    @InjectRepository(Whitelist)
    private whitelistRepository: Repository<Whitelist>,
    @InjectRepository(SubCarPark)
    private subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(Tenancy)
    private tenancyRepository: Repository<Tenancy>,
    private emailNotificationService: EmailNotificationService,
    @InjectRepository(Blacklist)
    private blacklistRepository: Repository<Blacklist>,
  ) {}

  async createSelfServeWhitelist(
    request: CreateSelfServeWhitelistRequest,
  ): Promise<CreateSelfServeWhitelistResponse> {
    const { registrationNumber, email, subCarParkId, tenancyId } = request;

    const existingWhitelist = await this.whitelistRepository.findOne({
      where: { registrationNumber, email, subCarParkId, tenancyId },
    });
    if (existingWhitelist) {
      throw new CustomException(
        ErrorCode.WHITELIST_PERMIT_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const subCarPark = await this.subCarParkRepository.exists({
      where: { id: subCarParkId },
    });
    if (!subCarPark) {
      throw new CustomException(
        ErrorCode.SUB_CAR_PARK_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isBlacklisted = await this.blacklistRepository.exists({
      where: { registrationNumber, subCarParkId },
    });
    if (isBlacklisted) {
      throw new CustomException(
        ErrorCode.REGISTRATION_NUMBER_BLACKLISTED_IN_SUB_CAR_PARK.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const tenancy = await this.tenancyRepository.exists({
      where: { id: tenancyId, subCarParkId },
    });
    if (!tenancy) {
      throw new CustomException(
        ErrorCode.TENANCY_NOT_FOUND.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const companyEmails = await this.subCarParkRepository.findOne({
      where: { id: subCarParkId },
      relations: { whitelistCompanies: true },
      select: { whitelistCompanies: { domainName: true } },
    });

    const domainNames = companyEmails.whitelistCompanies.map(
      (company) => company.domainName,
    );
    if (domainNames.includes(email)) {
      throw new CustomException(
        ErrorCode.DOMAIN_NAME_NOT_ALLOWED.key,
        HttpStatus.BAD_REQUEST,
      );
    }

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + 5 * 365 * 24 * 60 * 60 * 1000,
    );

    // Generate a unique token for this whitelist registration
    const token = crypto.randomBytes(32).toString("hex").toUpperCase();

    const entity = await this.whitelistRepository.save({
      registrationNumber,
      email,
      subCarParkId,
      tenancyId,
      whitelistType: WhitelistType.SELF_SERVE,
      comments: "Self serve whitelist created by " + email,
      startDate,
      endDate,
      token, // Add token to the entity
      status: WhitelistStatus.ACTIVE,
    });

    const savedEntity = await this.whitelistRepository.save(entity);

    // Send confirmation email
    try {
      await this.emailNotificationService.sendUsingTemplate({
        to: [email],
        templateKey: TemplateKeys.WHITELIST_CONFIRMATION,
        data: {
          email: email,
          registrationNumber: registrationNumber,
          whitelistType: WhitelistType.SELF_SERVE,
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
          comments: savedEntity.comments,
          token: token,
        },
      });
    } catch (emailError) {
      // Log email error but don't fail the registration
      console.error("Failed to send whitelist confirmation email:", emailError);
    }

    return {
      id: savedEntity.id,
      registrationNumber: savedEntity.registrationNumber,
      email: savedEntity.email,
      comments: savedEntity.comments,
      subCarParkId: savedEntity.subCarParkId,
      tenancyId: savedEntity.tenancyId,
      whitelistType: savedEntity.whitelistType,
      startDate: savedEntity.startDate,
      endDate: savedEntity.endDate,
      token: token, // Include token in response
    };
  }

  async getWhitelistByToken(
    token: string,
  ): Promise<GetWhitelistByTokenResponse> {
    const whitelist = await this.whitelistRepository.findOne({
      where: { token },
      relations: {
        subCarPark: true,
        tenancy: true,
      },
    });

    if (!whitelist) {
      throw new CustomException(
        ErrorCode.WHITELIST_NOT_FOUND.key,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: whitelist.id,
      registrationNumber: whitelist.registrationNumber,
      comments: whitelist.comments,
      email: whitelist.email,
      subCarParkId: whitelist.subCarParkId,
      tenancyId: whitelist.tenancyId,
      whitelistType: whitelist.whitelistType,
      startDate: whitelist.startDate,
      endDate: whitelist.endDate,
      subCarPark: {
        id: whitelist.subCarPark.id,
        name: whitelist.subCarPark.carParkName,
        code: whitelist.subCarPark.subCarParkCode,
      },
      tenancy: {
        id: whitelist.tenancy.id,
        name: whitelist.tenancy.tenantName,
        email: whitelist.tenancy.tenantEmail,
      },
    };
  }
}
