import { Module } from "@nestjs/common";
import { Employee } from "./employee.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeesService } from "./employees.service";


@Module({
  imports: [ TypeOrmModule.forFeature([Employee]) ],
  controllers: [ ],
    providers: [ EmployeesService ],
})
export class EmployeesModule {}