import { Module } from "@nestjs/common";
import { Employee } from "./employee.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeesService } from "./employees.service";
import { EmployeesAdminController } from "./employees-admin.controller";


@Module({
  imports: [ TypeOrmModule.forFeature([Employee]) ],
  controllers: [EmployeesAdminController],
    providers: [ EmployeesService ],
})
export class EmployeesModule {}