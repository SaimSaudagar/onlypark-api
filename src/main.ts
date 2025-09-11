import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigKeys, DependencyInjectionKeys } from './common/configs';
import { AppExceptionFilter } from './common/exceptions/app-exception.filter';
import { RequestContextService } from './common/services/request-context/request-context.service';
import { ExceptionUtils } from './common/utils/exception.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  const requestContext = app.get(RequestContextService);
  app.useGlobalFilters(
    new AppExceptionFilter(
      httpAdapterHost,
      requestContext,
    ),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => ExceptionUtils.handleNestException(errors),
      stopAtFirstError: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('OnlyPark API')
    .setDescription('The OnlyPark parking management system API')
    .setVersion('1.0')
    .addTag('onlypark')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>(ConfigKeys.APP_PORT) || 3000;
  await app.listen(port || 3000, '0.0.0.0');

  console.log(`🚀 OnlyPark API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
