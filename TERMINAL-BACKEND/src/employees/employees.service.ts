import { EmployeeResponseDto, } from "./dto/employee-response.dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Employee } from "./employee.entity";
import { Repository } from "typeorm";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>
  ) {}

  async findAll(): Promise<EmployeeResponseDto[]> {
    return this.employeeRepository.find({
      select: { id: true, name: true, active: true, createdAt: true },
      order: { id: 'ASC' },
    });
  }
}