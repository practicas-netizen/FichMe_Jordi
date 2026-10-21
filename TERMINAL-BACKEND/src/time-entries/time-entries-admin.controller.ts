import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AdminKeyGuard } from "../admin/admin-key.guard";
import { TimeEntriesQueryDto } from "./dto/time-entries-query.dto";
import { TimeEntriesPageDto } from "./dto/time-entry-response.dto";
import { TimeEntriesAdminService } from "./time-entries-admin.service";

@Controller('admin/companies/:companyId/time-entries')
@UseGuards(AdminKeyGuard)
@ApiSecurity('admin-key')
@ApiTags('Admin · Fichajes')
@ApiUnauthorizedResponse({ description: 'ADMIN_KEY_INVALID: falta la clave de administración o no es válida.' })
export class TimeEntriesAdminController {
    constructor(private readonly timeEntriesAdminService: TimeEntriesAdminService) {}

    @Get()
    @ApiOperation({
        summary: 'Consultar los fichajes de una empresa',
        description: 'Del más reciente al más antiguo. Los filtros son opcionales y las horas van en UTC.',
    })
    @ApiOkResponse({ type: TimeEntriesPageDto })
    @ApiBadRequestResponse({ description: 'Filtros no válidos, o INVALID_DATE_RANGE si "from" no es anterior a "to".' })
    @ApiNotFoundResponse({ description: 'COMPANY_NOT_FOUND: la empresa no existe.' })
    findAll(
        @Param('companyId', ParseIntPipe) companyId: number,
        // transform: convierte los parámetros de la URL (que llegan como texto) en números
        @Query(new ValidationPipe({ transform: true, whitelist: true })) query: TimeEntriesQueryDto,
    ) {
        return this.timeEntriesAdminService.findAll(companyId, query);
    }
}