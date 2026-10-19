import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Empresa de prueba' })
  name!: string;

  @ApiProperty({ example: 'B12345678' })
  NIF!: string;

  @ApiProperty({ example: '+34600000000' })
  phone!: string;

  @ApiProperty({ example: 'prueba@example.com' })
  email!: string;

  @ApiProperty({ example: 'ES9121000418450200051332' })
  IBAN!: string;
}