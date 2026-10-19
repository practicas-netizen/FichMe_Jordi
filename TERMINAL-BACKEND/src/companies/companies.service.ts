import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDuplicateEntry } from '../common/db-errors';
import { Companies } from './companies.entity';
import { CompanyCreateDto } from './dto/company-create.dto';
import { CompanyUpdateDto } from './dto/company-update.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Companies)
    private companiesRepository: Repository<Companies>,
  ) {}

  findAll(): Promise<Companies[]> {
    return this.companiesRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Companies> {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'COMPANY_NOT_FOUND',
        message: 'Empresa no encontrada',
      });
    }
    return company;
  }

  async create(dto: CompanyCreateDto): Promise<Companies> {
    try {
      return await this.companiesRepository.save(this.companiesRepository.create(this.normalize(dto)));
    } catch (e) {
      if (isDuplicateEntry(e)) throw this.nifDuplicated();
      throw e;
    }
  }

  async update(id: number, dto: CompanyUpdateDto): Promise<Companies> {
    const company = await this.findOne(id);
    Object.assign(company, this.normalize(dto));
    try {
      return await this.companiesRepository.save(company);
    } catch (e) {
      if (isDuplicateEntry(e)) throw this.nifDuplicated();
      throw e;
    }
  }

  // Deja los datos en un formato único: sin espacios sobrantes y en mayúsculas
  private normalize(dto: CompanyUpdateDto): CompanyUpdateDto {
    return {
      ...dto,
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.NIF !== undefined && { NIF: dto.NIF.toUpperCase() }),
      ...(dto.IBAN !== undefined && { IBAN: dto.IBAN.toUpperCase() }),
    };
  }

  private nifDuplicated() {
    return new ConflictException({
      statusCode: 409,
      code: 'COMPANY_NIF_DUPLICATED',
      message: 'Ya existe una empresa con ese NIF',
    });
  }
}