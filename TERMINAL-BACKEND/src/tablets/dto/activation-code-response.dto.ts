import { ApiProperty } from '@nestjs/swagger';

export class ActivationCodeResponseDto {
  @ApiProperty({ example: 'K7QM-3XPD', description: 'Código de un solo uso para activar una tablet' })
  code!: string;

  @ApiProperty({ example: 1 })
  companyId!: number;

  @ApiProperty({ example: '2026-10-21T10:30:00.000Z', description: 'Fecha de caducidad (UTC)' })
  expiresAt!: Date;
}
