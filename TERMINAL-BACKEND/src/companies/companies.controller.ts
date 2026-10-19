import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminKeyGuard } from '../admin/admin-key.guard';
import { CompaniesService } from './companies.service';
import { CompanyCreateDto } from './dto/company-create.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CompanyUpdateDto } from './dto/company-update.dto';

@Controller('admin/companies')
@UseGuards(AdminKeyGuard)
@ApiSecurity('admin-key')
@ApiTags('Admin · Empresas')
@ApiUnauthorizedResponse({ description: 'ADMIN_KEY_INVALID: falta la clave de administración o no es válida.' })
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empresas' })
  @ApiOkResponse({ type: [CompanyResponseDto] })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa' })
  @ApiOkResponse({ type: CompanyResponseDto })
  @ApiNotFoundResponse({ description: 'COMPANY_NOT_FOUND: la empresa no existe.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una empresa' })
  @ApiCreatedResponse({ type: CompanyResponseDto })
  @ApiConflictResponse({ description: 'COMPANY_NIF_DUPLICATED: ya existe una empresa con ese NIF.' })
  create(@Body() dto: CompanyCreateDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar una empresa (solo los campos enviados)' })
  @ApiOkResponse({ type: CompanyResponseDto })
  @ApiNotFoundResponse({ description: 'COMPANY_NOT_FOUND: la empresa no existe.' })
  @ApiConflictResponse({ description: 'COMPANY_NIF_DUPLICATED: ya existe una empresa con ese NIF.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CompanyUpdateDto) {
    return this.companiesService.update(id, dto);
  }
}