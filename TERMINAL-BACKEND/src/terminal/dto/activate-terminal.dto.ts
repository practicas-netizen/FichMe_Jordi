import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ActivateTerminalDto{
    @ApiProperty({ example: 'TEST-0001' })
    @IsString() 
    @MaxLength(20)
    @IsNotEmpty()
    code!: string; 
}