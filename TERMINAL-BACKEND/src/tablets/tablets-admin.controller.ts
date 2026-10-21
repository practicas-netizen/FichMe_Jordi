import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminKeyGuard } from "../admin/admin-key.guard";
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { TabletsService } from "./tablets.service";
import { ActivationCodeResponseDto } from "./dto/activation-code-response.dto";
import { CreateActivationCodeDto } from "./dto/create-activation-code.dto";
import { DeviceResponseDto } from "./dto/device-response.dto";


@Controller('admin')
@UseGuards(AdminKeyGuard)
@ApiSecurity('admin-key')
@ApiTags('Admin · Tablets')
@ApiUnauthorizedResponse({ description: 'ADMIN_KEY_INVALID: falta la clave de administración o no es valida.'})
export class TabletsAdminController {
    constructor(private readonly tabletsService: TabletsService) {}

    @Post('companies/:companyId/activation-codes')
    @ApiOperation({
        summary: 'Generar un código de activación',
        description: 'Crea un código de un solo uso para vincular una tablet a la empresa. Caduca a las 24 h salvo que se indique otro plazo.',
    })
    @ApiCreatedResponse({ type: ActivationCodeResponseDto })
    @ApiNotFoundResponse({ description: 'COMPANY_NOT_FOUND: la empresa no existe.' })
    createActivationCode(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Body() dto: CreateActivationCodeDto
    ) {
        return this.tabletsService.createActivationCode(companyId, dto);
    }

    @Get('companies/:companyId/devices')
    @ApiOperation({ summary: 'Listar las tablets de la empresa' })
    @ApiOkResponse({ type: [DeviceResponseDto] })
    @ApiNotFoundResponse({ description: 'COMPANY_NOT_FOUND: la empresa no exitse.' })
    findDevices(@Param('companyId', ParseIntPipe) companyId: number) {
        return this.tabletsService.findDevices(companyId);
    }

    @Patch('devices/:id/revoke')
    @ApiOperation({ 
        summary: 'Revocar una tablet', 
        description: 'La tablet deja de poder usar la API de inmediato (DEVICE_REVOKED). Si ya estaba revocada, devuelve su estado sin cambios.',
    })
    @ApiOkResponse({ type: DeviceResponseDto })
    @ApiNotFoundResponse({ description: 'DEVICE_NOT_FOUND: la tablet no existe.' })
    revokeDevice(@Param('id', ParseIntPipe) id: number) {
        return this.tabletsService.revokeDevice(id);
    }
}