import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { EmployeeCreateDto } from "./employee-create.dto";
import { IsBoolean, IsOptional } from "class-validator";


export class EmployeeUpdateDto extends PartialType(EmployeeCreateDto) {
    @ApiPropertyOptional({ example: true, description: 'Si es falso se da de baja, no se puede fichar ' })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
}