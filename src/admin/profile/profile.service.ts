import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Admin } from "../entities/admin.entity";
import { AdminStatus } from "../../common/enums";
import { CustomException } from "../../common/exceptions/custom.exception";
import { ErrorCode } from "../../common/exceptions/error-code";
import { CreateProfileDto, UpdateProfileDto } from "./profile.dto";
import { FileUploadService } from "../../common/services/file-upload/file-upload.service";
import { UserService } from "../../user/user.service";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly fileUploadService: FileUploadService,
    private readonly userService: UserService
  ) {}

  async create(request: CreateProfileDto, image?: Express.Multer.File) {
    const adminInDb = await this.adminRepository.findOne({
      where: { userId: request.userId },
    });

    if (adminInDb) {
      throw new CustomException(
        ErrorCode.ADMIN_ALREADY_EXISTS.key,
        HttpStatus.BAD_REQUEST
      );
    }

    // Upload image to S3 if provided
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.fileUploadService.uploadFile(image, "profiles");
      // Update user with image URL
      await this.userService.updateUserImage(request.userId, imageUrl);
    }

    const savedAdmin = await this.adminRepository.save({
      userId: request.userId,
      status: AdminStatus.ACTIVE,
    });
    return savedAdmin;
  }

  findAll() {
    return this.adminRepository.find({ relations: ["user"] });
  }

  findOne(id: string) {
    return this.adminRepository.findOne({ where: { id }, relations: ["user"] });
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
    image?: Express.Multer.File
  ) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new Error(`Admin with ID ${id} not found`);
    }

    // Upload image to S3 if provided
    if (image) {
      const imageUrl = await this.fileUploadService.uploadFile(
        image,
        "profiles"
      );
      // Update user with image URL
      await this.userService.updateUserImage(admin.userId, imageUrl);
    }

    Object.assign(admin, updateProfileDto);
    return await this.adminRepository.save(admin);
  }

  async remove(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new Error(`Admin with ID ${id} not found`);
    }

    return await this.adminRepository.remove(admin);
  }
}
