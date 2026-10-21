import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompaniesService } from "../companies/companies.service";
import { TimeEntry } from "../terminal/time-entry.entity";
import { TimeEntriesQueryDto } from "./dto/time-entries-query.dto";
import { TimeEntriesPageDto, TimeEntryResponseDto } from "./dto/time-entry-response.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

@Injectable()
export class TimeEntriesAdminService {
    constructor(
        @InjectRepository(TimeEntry)
        private timeEntryRepository: Repository<TimeEntry>,
        private companiesService: CompaniesService,
    ) {}

    async findAll(companyId: number, query: TimeEntriesQueryDto): Promise<TimeEntriesPageDto> {
        await this.companiesService.findOne(companyId); // 404 si la empresa no existe

        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;
        const from = query.from ? new Date(query.from) : undefined;
        const to = query.to ? new Date(query.to) : undefined;

        if (from && to && from >= to) {
            throw new BadRequestException({
                statusCode: 400,
                code: 'INVALID_DATE_RANGE',
                message: 'La fecha de inicio tiene que ser anterior a la de fin',
            });
        }

        // time_entries no tiene company_id: la empresa se saca del empleado.
        // Solo se piden los campos necesarios, así el PIN del empleado ni se lee de la base de datos.
        const qb = this.timeEntryRepository
            .createQueryBuilder('entry')
            .innerJoin('entry.employee', 'employee')
            .leftJoin('entry.terminalDevice', 'device')
            .select(['entry.id', 'entry.type', 'entry.clockedAt', 'employee.id', 'employee.name', 'device.id', 'device.name'])
            .where('employee.companyId = :companyId', { companyId });

        if (from) qb.andWhere('entry.clockedAt >= :from', { from });
        if (to) qb.andWhere('entry.clockedAt < :to', { to });
        if (query.employeeId) qb.andWhere('employee.id = :employeeId', { employeeId: query.employeeId });
        if (query.deviceId) qb.andWhere('device.id = :deviceId', { deviceId: query.deviceId });

        const [entries, total] = await qb
            .orderBy('entry.clockedAt', 'DESC')
            .addOrderBy('entry.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { items: entries.map((entry) => this.toResponse(entry)), total, page, limit };
    }

    private toResponse(entry: TimeEntry): TimeEntryResponseDto {
        return {
            id: entry.id,
            type: entry.type,
            clockedAt: entry.clockedAt,
            employee: { id: entry.employee.id, name: entry.employee.name },
            device: entry.terminalDevice ? { id: entry.terminalDevice.id, name: entry.terminalDevice.name } : null,
        };
    }
}