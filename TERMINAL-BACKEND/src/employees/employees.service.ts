import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDuplicateEntry } from '../common/db-errors';
import { CompaniesService } from '../companies/companies.service';
import { EmployeeCreateDto } from './dto/employee-create.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeeUpdateDto } from './dto/employee-update.dto';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private companiesService: CompaniesService,
  ) {}

  async findAll(companyId: number): Promise<EmployeeResponseDto[]> {
    await this.companiesService.findOne(companyId); // 404 si la empresa no existe
    const employees = await this.employeeRepository.find({
      where: { companyId },
      order: { id: 'ASC' },
    });
    return employees.map((employee) => this.toResponse(employee));
  }

  async create(companyId: number, dto: EmployeeCreateDto): Promise<EmployeeResponseDto> {
    await this.companiesService.findOne(companyId);
    try {
      const saved = await this.employeeRepository.save(
        this.employeeRepository.create({ companyId, name: dto.name.trim(), pin: dto.pin }),
      );
      // Se vuelve a leer para devolver también los valores por defecto de la base de datos
      return this.toResponse(await this.findEntity(companyId, saved.id));
    } catch (e) {
      if (isDuplicateEntry(e)) throw this.pinDuplicated();
      throw e;
    }
  }

  async update(companyId: number, id: number, dto: EmployeeUpdateDto): Promise<EmployeeResponseDto> {
    const employee = await this.findEntity(companyId, id);
    if (dto.name !== undefined) employee.name = dto.name.trim();
    if (dto.pin !== undefined) employee.pin = dto.pin;
    if (dto.active !== undefined) employee.active = dto.active;
    try {
      await this.employeeRepository.save(employee);
    } catch (e) {
      if (isDuplicateEntry(e)) throw this.pinDuplicated();
      throw e;
    }
    return this.toResponse(employee);
  }

  // No se borra de verdad: el empleado puede tener fichajes. Se da de baja.
  async deactivate(companyId: number, id: number): Promise<EmployeeResponseDto> {
    const employee = await this.findEntity(companyId, id);
    if (employee.active) {
      employee.active = false;
      await this.employeeRepository.save(employee);
    }
    return this.toResponse(employee);
  }

  // Busca por id Y por empresa: un empleado de otra empresa se trata como inexistente
  private async findEntity(companyId: number, id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id, companyId } });
    if (!employee) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Empleado no encontrado',
      });
    }
    return employee;
  }

  private toResponse(employee: Employee): EmployeeResponseDto {
    return {
      id: employee.id,
      companyId: employee.companyId,
      name: employee.name,
      active: employee.active,
      createdAt: employee.createdAt,
    };
  }

  private pinDuplicated() {
    return new ConflictException({
      statusCode: 409,
      code: 'EMPLOYEE_PIN_DUPLICATED',
      message: 'Ya existe un empleado con ese PIN en esta empresa',
    });
  }
}