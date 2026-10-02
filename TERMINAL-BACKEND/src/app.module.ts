import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule  } from '@nestjs/typeorm';

@Module({
 imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: 'bridgeone_terminal_user',
        password: 'Gh9kpxYuCG5nrfaP5KeMbzJ3',
        database: 'bridgeone_terminal',
        autoLoadEntities: true,
        synchronize: false, // Set to false in production to avoid data loss
    }),
  }),
],
  controllers: [AppController],
})


export class AppModule {}