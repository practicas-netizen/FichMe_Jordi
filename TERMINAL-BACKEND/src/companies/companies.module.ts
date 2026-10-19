import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Companies } from './companies.entity';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Companies])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService], // EmployeesModule lo usa para comprobar que la empresa existe
})
export class CompaniesModule {}