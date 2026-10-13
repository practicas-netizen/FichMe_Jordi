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
    .setDescription('Aqui és donde va a salir todo los enpoints (admin, empleados, terminales...) que se vayan haciendo durante el proyecto.')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-admin-key' }, 'admin-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  if (enableCors) {
    app.enableCors();
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.useBodyParser('json', { limit: '2mb' })

  await app.listen(apiPort);
}
bootstrap();