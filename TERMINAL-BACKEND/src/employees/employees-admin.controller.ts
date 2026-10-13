import { Controller, Get, UseGuards, Post, Delete } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminKeyGuard } from '../admin/admin-key.guard';
import { EmployeesService } from './employees.service';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeeCreateDto } from './dto/employee-create.dto';
import { EmployeeDeleteDto } from './dto/employee-delete.dto';

@Controller('/admin/employees')
@UseGuards(AdminKeyGuard)
@ApiSecurity('admin-key')
@ApiTags('Admin · Empleados')
export class EmployeesAdminController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    @ApiOperation({ summary: 'Obtener empleados' })
    @ApiOkResponse({ type: [EmployeeResponseDto] })
    @ApiUnauthorizedResponse({ description: 'ADMIN_KEY_INVALID: falta la clave de administración o no es válida.' })
    findAll() {
        return this.employeesService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Registrar o crear un nuevo empleado' })
    @ApiOkResponse({ type: [EmployeeCreateDto] })
    @ApiUnauthorizedResponse({ description: 'EMPLOYEE_KEY_INVALID: faltan datos del empleado o datos no válidos.' })
    find() {
        return this.employeesService.findAll();
    }

    @Delete()
    @ApiOperation({ summary: 'Eliminar usuario' })
    @ApiOkResponse({ type: [EmployeeDeleteDto] })
    @ApiUnauthorizedResponse({ description: 'ACTIVATION_CODE_NOT_FOUND: Empleado con datos erroneos o empleado ya eliminado' })
    findA() {
        return this.employeesService.findAll();
    }

}