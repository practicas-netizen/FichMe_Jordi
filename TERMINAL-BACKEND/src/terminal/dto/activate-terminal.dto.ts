import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ActivateTerminalDto{
    @ApiProperty({ example: 'TEST-0001' })
    @IsString() 
    @MaxLength(20)
    @IsNotEmpty()
    code!: string; 
}