import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { Admin } from "../entities/admin.entity";
import { FileUploadModule } from "../../common/services/file-upload/file-upload.module";
import { UserModule } from "../../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), FileUploadModule, UserModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
