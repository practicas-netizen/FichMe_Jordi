import { ApiProperty } from "@nestjs/swagger";
import { TimeEntryType } from "../../terminal/time-entry.entity";

export class TimeEntryEmployeeDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Ana Prueba' })
    name!: string;
}

export class TimeEntryDeviceDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Terminal' })
    name!: string;
}

export class TimeEntryResponseDto {
    @ApiProperty({ example: '1024', description: 'El id es un bigint, por eso va como texto' })
    id!: string;

    @ApiProperty({ enum: TimeEntryType, example: TimeEntryType.IN })
    type!: TimeEntryType;

    @ApiProperty({ example: '2026-10-21T09:02:11.000Z', description: 'Fecha y hora del fichaje en UTC' })
    clockedAt!: Date;

    @ApiProperty({ type: TimeEntryEmployeeDto })
    employee!: TimeEntryEmployeeDto;

    @ApiProperty({ type: TimeEntryDeviceDto, nullable: true, description: 'Tablet desde la que se fichó (null si la tablet ya no existe)' })
    device!: TimeEntryDeviceDto | null;
}

export class TimeEntriesPageDto {
    @ApiProperty({ type: [TimeEntryResponseDto] })
    items!: TimeEntryResponseDto[];

    @ApiProperty({ example: 120, description: 'Total de fichajes que cumplen los filtros (no solo los de esta página)' })
    total!: number;

    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 50 })
    limit!: number;
}