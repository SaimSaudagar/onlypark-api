import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { RoleSeederService } from './role/role-seeder.service';
import { PermissionSeederService } from './permission/permission-seeder.service';
import { RolePermissionSeederService } from './role-permission/role-permission-seeder.service';
import { UserSeederService } from './user/user-seeder.service';
import { CarMakeSeederService } from './car-make/car-make-seeder.service';
import { MasterCarParkSeederService } from './master-car-park/master-car-park-seeder.service';
import { SubCarParkSeederService } from './sub-car-park/sub-car-park-seeder.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeederModule);

  try {
    console.log('Starting seeding process...');

    // Seed roles first
    console.log('Seeding roles...');
    await app.get(RoleSeederService).run();

    // Seed permissions
    console.log('Seeding permissions...');
    await app.get(PermissionSeederService).run();

    // Assign permissions to roles
    console.log('Assigning permissions to roles...');
    await app.get(RolePermissionSeederService).run();

    // Seed car makes
    console.log('Seeding car makes...');
    await app.get(CarMakeSeederService).run();

    // Seed master car parks
    console.log('Seeding master car parks...');
    await app.get(MasterCarParkSeederService).run();

    // Seed sub car parks
    console.log('Seeding sub car parks...');
    await app.get(SubCarParkSeederService).run();

    // Seed users last (after roles and permissions are set up)
    console.log('Seeding users...');
    await app.get(UserSeederService).run();

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
};

void runSeed();
