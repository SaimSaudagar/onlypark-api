import { NestFactory } from "@nestjs/core";
import { SeederModule } from "./seeder.module";
import { UserSeederService } from "./user/user-seeder.service";
import { CarMakeSeederService } from "./car-make/car-make-seeder.service";
import { MasterCarParkSeederService } from "./master-car-park/master-car-park-seeder.service";
import { SubCarParkSeederService } from "./sub-car-park/sub-car-park-seeder.service";
import { TenancySeederService } from "./tenancy/tenancy-seeder.service";
import { WhitelistCompanySeederService } from "./whitelist-company/whitelist-company-seeder.service";
import { InfringementCarParkSeederService } from "./infringement-car-park/infringement-car-park-seeder.service";
import { InfringementPenaltySeederService } from "./infringement-penalty/infringement-penalty-seeder.service";
import { InfringementReasonSeederService } from "./infringement-reason/infringement-reason-seeder.service";

const runSeed = async () => {
  const app = await NestFactory.create(SeederModule);

  try {
    console.log("Starting seeding process...");

    // // Seed roles first
    // console.log('Seeding roles...');
    // await app.get(RoleSeederService).run();

    // // Seed permissions
    // console.log('Seeding permissions...');
    // await app.get(PermissionSeederService).run();

    // // Assign permissions to roles
    // console.log('Assigning permissions to roles...');
    // await app.get(RolePermissionSeederService).run();

    // Seed car makes
    console.log("Seeding car makes...");
    await app.get(CarMakeSeederService).run();

    // Seed master car parks
    console.log("Seeding master car parks...");
    await app.get(MasterCarParkSeederService).run();

    // Seed sub car parks
    console.log("Seeding sub car parks...");
    await app.get(SubCarParkSeederService).run();

    // Seed tenancies
    console.log("Seeding tenancies...");
    await app.get(TenancySeederService).run();

    // Seed whitelist companies
    console.log("Seeding whitelist companies...");
    await app.get(WhitelistCompanySeederService).run();

    // Seed infringement car parks
    console.log("Seeding infringement car parks...");
    await app.get(InfringementCarParkSeederService).run();

    // Seed infringement penalties (after car parks are created)
    console.log("Seeding infringement penalties...");
    await app.get(InfringementPenaltySeederService).run();

    // Seed infringement reasons
    console.log("Seeding infringement reasons...");
    await app.get(InfringementReasonSeederService).run();

    // Seed users last (after roles and permissions are set up)
    console.log("Seeding users...");
    await app.get(UserSeederService).run();

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await app.close();
  }
};

void runSeed();
