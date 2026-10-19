import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class EmployeeCreateDto {
  @ApiProperty({ example: 'Jordi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: '123456', description: '6 dígitos, único dentro de la empresa' })
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'pin debe tener exactamente 6 dígitos' })
  pin!: string;
}