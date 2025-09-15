import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Middleware imports
import { RequestContextMiddleware } from './common/middlewares/request-context.middleware';
import { TraceIdMiddleware } from './common/middlewares/trace-id.middleware';
import { HttpLoggingMiddleware } from './common/middlewares/http-logging.middleware';

// Configuration imports
import { ConfigConstants, ConfigKeys, DependencyInjectionKeys } from './common';

// Core modules
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AdminModule } from './admin/admin.module';
import { CarparkManagerModule } from './carpark-manager/carpark-manager.module';
import { MasterCarParkModule } from './master-car-park/master-car-park.module';
import { SubCarParkModule } from './sub-car-park/sub-car-park.module';

import { TenancyModule } from './tenancy/tenancy.module';
import { WhitelistModule } from './whitelist/whitelist.module';
import { WhitelistCompanyModule } from './whitelist-company/whitelist-company.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { InfringementModule } from './infringement/infringement.module';
import { DisputeModule } from './dispute/dispute.module';
import { PatrolOfficerModule } from './patrol-officer/patrol-officer.module';
import { VisitorBookingModule } from './visitor-booking/visitor-booking.module';
import { OutstandingRegistrationModule } from './outstanding-registration/outstanding-registration.module';
import { AuditLogModule } from './common/services/audit-log/audit-log.module';
import { RequestContextModule } from './common/services/request-context/request-context.module';
import { AuditSubscriber } from './common/services/audit-log/audit-log.subscriber';
import { CarMakeModule } from './car-make/car-make.module';

// Common service modules
import { EmailModule } from './common/services/email/email.module';
import { SmsModule } from './common/services/sms/sms.module';
import { PushNotificationModule } from './common/services/push-notification/push-notification.module';
import { QrCodeModule } from './common/services/qr-code/qr-code.module';
import { GeolocationModule } from './common/services/geolocation/geolocation.module';
import { PaymentModule } from './common/services/payment/payment.module';
import { FileUploadModule } from './common/services/file-upload/file-upload.module';
import { TemplateEngineModule } from './common/services/template-engine/template-engine.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: ConfigConstants.DB_TYPE,
        host: configService.get<string>(ConfigKeys.DB_HOST_NAME),
        port: parseInt(configService.get<string>(ConfigKeys.DB_PORT) || '5432'),
        username: configService.get<string>(ConfigKeys.DB_USER),
        password: configService.get<string>(ConfigKeys.DB_PASSWORD),
        database: configService.get<string>(ConfigKeys.DB_NAME),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        ...(process.env.NODE_ENV === 'production' && {
          ssl: { rejectUnauthorized: false },
        }),
        timezone: 'Z',
      }),
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>(ConfigKeys.REDIS_HOST) || 'localhost',
          port: parseInt(configService.get<string>(ConfigKeys.REDIS_PORT) || '6379'),
          password: configService.get<string>(ConfigKeys.REDIS_PASSWORD) || undefined,
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AdminModule,
    CarparkManagerModule,
    MasterCarParkModule,
    SubCarParkModule,

    TenancyModule,
    WhitelistModule,
    WhitelistCompanyModule,
    BlacklistModule,
    InfringementModule,
    DisputeModule,
    PatrolOfficerModule,
    VisitorBookingModule,
    OutstandingRegistrationModule,
    AuditLogModule,
    RequestContextModule,
    CarMakeModule,

    // Common service modules
    EmailModule,
    SmsModule,
    PushNotificationModule,
    QrCodeModule,
    GeolocationModule,
    PaymentModule,
    FileUploadModule,
    TemplateEngineModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuditSubscriber,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, HttpLoggingMiddleware)
      .forRoutes('*');
  }
}
