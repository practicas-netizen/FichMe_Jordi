import { ApiProperty } from "@nestjs/swagger";
import { TerminalDeviceStatus } from "../../terminal/terminal-device.entity";


export class DeviceResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Terminal' })
    name!: string;

    @ApiProperty({ enum: TerminalDeviceStatus, example: TerminalDeviceStatus.ACTIVE })
    status!: TerminalDeviceStatus;

    @ApiProperty({ example: 1 })
    companyId!: number;

    @ApiProperty({ example: '2026-10-20T08:00:00.000Z' })
    activatedAt!: Date;

    @ApiProperty({ type: String, format: 'date-time', nullable: true, example: '2026-10-20T09:02:11.000Z' })
    lastSeenAt!: Date | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true, example: null })
    revokedAt!: Date | null;
}