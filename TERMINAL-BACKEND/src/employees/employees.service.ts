import { Injectable } from "@nestjs/common";
import { Employee } from "./employee.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";



@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>
  ) {}

  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }
}



