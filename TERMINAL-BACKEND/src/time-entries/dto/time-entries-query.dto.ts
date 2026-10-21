import { applyDecorators } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsISO8601, IsOptional, Matches, Max, Min } from "class-validator";

// Acepta "2026-10-21" o "2026-10-21T08:00:00Z". Si lleva hora, tiene que llevar también la zona
// (Z o +02:00), para que no dependa de la zona horaria del ordenador donde corra el servidor.
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2}))?$/;

function IsFilterDate() {
    return applyDecorators(
        IsOptional(),
        IsISO8601({ strict: true }),
        Matches(DATE_FORMAT, { message: 'La fecha debe ser 2026-10-21 o 2026-10-21T08:00:00Z (con zona horaria si lleva hora)' }),
    );
}

export class TimeEntriesQueryDto {
    @ApiPropertyOptional({
        example: '2026-10-21',
        description: 'Fichajes desde esta fecha (incluida). Sin hora se entiende 00:00 UTC.',
    })
    @IsFilterDate()
    from?: string;

    @ApiPropertyOptional({
        example: '2026-10-22',
        description: 'Hasta esta fecha (sin incluirla). Para ver un día: from=2026-10-21 y to=2026-10-22.',
    })
    @IsFilterDate()
    to?: string;

    @ApiPropertyOptional({ example: 1, description: 'Id del empleado.' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    employeeId?: number;

    @ApiPropertyOptional({ example: 1, description: 'Solo los fichajes hechos desde esta tablet.' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    deviceId?: number;

    @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 50, default: 50, minimum: 1, maximum: 200 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(200)
    limit?: number;
}