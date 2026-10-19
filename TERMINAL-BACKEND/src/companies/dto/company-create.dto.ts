import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CompanyCreateDto {
  @ApiProperty({ example: 'Empresa C' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: 'B11223344', description: '9 caracteres alfanuméricos' })
  @Matches(/^[A-Za-z0-9]{9}$/, { message: 'NIF debe tener 9 caracteres alfanuméricos' })
  NIF!: string;

  @ApiProperty({ example: '+34622222222' })
  @Matches(/^\+?[0-9]{6,14}$/, { message: 'phone no es un teléfono válido' })
  phone!: string;

  @ApiProperty({ example: 'c@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'ES9121000418450200051332', description: 'Sin espacios' })
  @Matches(/^[A-Za-z]{2}[0-9]{2}[A-Za-z0-9]{11,30}$/, { message: 'IBAN no es válido' })
  IBAN!: string;
}