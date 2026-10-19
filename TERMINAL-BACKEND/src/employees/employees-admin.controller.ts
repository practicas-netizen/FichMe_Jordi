import { Controller, Get, UseGuards, Post, Delete, ParseIntPipe, Param, Body, Patch } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminKeyGuard } from '../admin/admin-key.guard';
import { EmployeesService } from './employees.service';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeeCreateDto } from './dto/employee-create.dto';
import { EmployeeUpdateDto } from './dto/employee-update.dto';

@Controller('/admin/companies/:companyId/employees')
@UseGuards(AdminKeyGuard)
@ApiSecurity('admin-key')
@ApiTags('Admin · Empleados')
@ApiUnauthorizedResponse({ description: 'ADMIN_KEY_INVALID: falta la clave de administración o la clave puesta no es válida.' })
export class EmployeesAdminController {
    constructor(private readonly employeesService: EmployeesService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener empleados de la empresa' })
    @ApiOkResponse({ type: [EmployeeResponseDto] })
    @ApiNotFoundResponse({ description: 'COMPANY_NOT_FOUND: la empresa no existe.'})
    @ApiUnauthorizedResponse({ description: 'ADMIN_KEY_INVALID: falta la clave de administración o no es válida.' })
    findAll(@Param('companyId', ParseIntPipe) companyId: number) {
        return this.employeesService.findAll(companyId);
    }

    @Post()
    @ApiOperation({ summary: 'Registrar o crear un nuevo empleado' })
    @ApiCreatedResponse({ type: [EmployeeResponseDto] })
    @ApiNotFoundResponse({ description: 'COMPANY_NOT_FOUND: la empresa no existe.'})
    @ApiConflictResponse({ description: 'EMPLOYEE_PIN_DUPLICATED: ese PIN ya ha sido usado por otro empleado.'})
    @ApiUnauthorizedResponse({ description: 'EMPLOYEE_KEY_INVALID: faltan datos del empleado o datos no válidos.' })
    create(@Param('companyId', ParseIntPipe) companyId: number, @Body() dto: EmployeeCreateDto) {
        return this.employeesService.create(companyId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Modificar un empleado (nombre, PIN...) '})
    @ApiOkResponse({ type: EmployeeResponseDto })
    @ApiNotFoundResponse({ description: 'EMPLOYEE_NOT_FOUND: el empleado no existe.' })
    @ApiConflictResponse({ description: 'EMPLOYEE_PIN_DUPLICATED: ese PIN ya ha sido usado por otro empleado.' })
    update( @Param('companyId', ParseIntPipe) companyId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: EmployeeUpdateDto, ) {
        return this.employeesService.update(companyId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Dar de baja a un empleado' })
    @ApiOkResponse({ type: [EmployeeResponseDto] })
    @ApiNotFoundResponse({ description: 'EMPLOYEE_NOT_FOUND: el empleado se ha dado de baja.'})
    deactivate( @Param('companyId', ParseIntPipe) companyId: number, @Param('id', ParseIntPipe) id: number, ) {
        return this.employeesService.deactivate(companyId, id);
    }

}