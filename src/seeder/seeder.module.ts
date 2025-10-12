import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

// Seeder modules
import { RoleSeederModule } from "./role/role-seeder.module";
import { PermissionSeederModule } from "./permission/permission-seeder.module";
import { RolePermissionSeederModule } from "./role-permission/role-permission-seeder.module";
import { UserSeederModule } from "./user/user-seeder.module";
import { CarMakeSeederModule } from "./car-make/car-make-seeder.module";
import { MasterCarParkSeederModule } from "./master-car-park/master-car-park-seeder.module";
import { SubCarParkSeederModule } from "./sub-car-park/sub-car-park-seeder.module";
import { TenancySeederModule } from "./tenancy/tenancy-seeder.module";
import { WhitelistCompanySeederModule } from "./whitelist-company/whitelist-company-seeder.module";
import { InfringementCarParkSeederModule } from "./infringement-car-park/infringement-car-park-seeder.module";
import { InfringementPenaltySeederModule } from "./infringement-penalty/infringement-penalty-seeder.module";
import { InfringementReasonSeederModule } from "./infringement-reason/infringement-reason-seeder.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST_NAME") || "localhost",
        port: parseInt(configService.get<string>("DB_PORT") || "5432"),
        username: configService.get<string>("DB_USER") || "postgres",
        password: configService.get<string>("DB_PASSWORD") || "password",
        database: configService.get<string>("DB_NAME") || "onlypark",
        entities: [__dirname + "/../**/*.entity{.ts,.js}"],
        synchronize: false,
        logging: process.env.NODE_ENV === "development",
        timezone: "Z",
        ...(process.env.NODE_ENV === "production" && {
          ssl: { rejectUnauthorized: false },
        }),
      }),
      inject: [ConfigService],
    }),

    // Seeder modules
    RoleSeederModule,
    PermissionSeederModule,
    RolePermissionSeederModule,
    UserSeederModule,
    CarMakeSeederModule,
    MasterCarParkSeederModule,
    SubCarParkSeederModule,
    TenancySeederModule,
    WhitelistCompanySeederModule,
    InfringementCarParkSeederModule,
    InfringementPenaltySeederModule,
    InfringementReasonSeederModule,
  ],
})
export class SeederModule {}
