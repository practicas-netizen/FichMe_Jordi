import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiPort = Number(configService.getOrThrow('API_PORT'));
  const enableCors = configService.getOrThrow('ENABLE_CORS') === 'true';
  const config = new DocumentBuilder()
  .setTitle('Swagger')
  .setDescription('Ver endpoints de las API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document, {
  swaggerOptions: { persistAuthorization: true },
});

  if (enableCors) {
    app.enableCors();
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  await app.listen(apiPort);
}
bootstrap();