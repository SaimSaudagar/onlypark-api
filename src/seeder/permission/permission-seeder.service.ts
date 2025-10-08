import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "../../permission/entities/permission.entity";
import { FileUtils } from "../../common/utils/file.utils";

@Injectable()
export class PermissionSeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Permission Data seed");
    const permissions = FileUtils.getDataForSeeding("permissions");

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          name: permissionData.name,
          description: permissionData.description,
        });

        await this.permissionRepository.create(permission);
        this.logger.log(`Permission ${permissionData.name} seeded`);
      } else {
        this.logger.log(`Permission ${permissionData.name} already exists`);
      }
    }
  }
}
