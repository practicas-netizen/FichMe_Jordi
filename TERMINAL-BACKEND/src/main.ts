import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const apiPort = Number(configService.getOrThrow('API_PORT'));
  const enableCors = configService.getOrThrow('ENABLE_CORS') === 'true';
const config = new DocumentBuilder()
    .setTitle('Swagger')
    .setDescription('Ver endpoints del proyecto')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-admin-key' }, 'admin-key')
    .addTag('App')
    .addTag('Admin')
    .addTag('Admin · Empresas')
    .addTag('Admin · Empleados')
    .addTag('Admin · Tablets')
    .addTag('Admin · Fichajes')
    .addTag('Terminal')
    .addTag('TimeEntries')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  if (enableCors) {
    app.enableCors();
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.useBodyParser('json', { limit: '8mb' })

  await app.listen(apiPort);
}
bootstrap();