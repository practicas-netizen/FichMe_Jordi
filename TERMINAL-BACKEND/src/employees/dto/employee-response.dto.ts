
import { ApiProperty } from "@nestjs/swagger";

export class EmployeeResponseDto{
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 1 })
    companyId!: number;
    
    @ApiProperty({ example: 'Jordi' })
    name!: string;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty({ example: '2026-10-02T09:00:29.669Z' })
    createdAt!: Date;  
}