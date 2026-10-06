import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiPort = Number(configService.getOrThrow('API_PORT'));
  const enableCors = configService.getOrThrow('ENABLE_CORS') === 'true';
  const config = new DocumentBuilder()
  .setTitle('Swagger')
  .setDescription('Ver endpoints de las API')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);

  if (enableCors) {
    app.enableCors();
  }
  await app.listen(apiPort);
}
bootstrap();