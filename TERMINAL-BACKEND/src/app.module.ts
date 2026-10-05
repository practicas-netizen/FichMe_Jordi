import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule  } from '@nestjs/typeorm';
import { EmployeesModule } from './employees/employees.module';
import { TerminalModule } from './terminal/terminal.module';

@Module({
 imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<number>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, // False = No perder datos en producción
        timezone: 'Z',
    }),
  }),
  EmployeesModule,
  TerminalModule
],
  controllers: [AppController],
})


export class AppModule {}