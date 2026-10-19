import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module';
import { EmployeesAdminController } from './employees-admin.controller';
import { Employee } from './employee.entity';
import { EmployeesService } from './employees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), CompaniesModule],
  controllers: [EmployeesAdminController],
  providers: [EmployeesService],
})
export class EmployeesModule {}