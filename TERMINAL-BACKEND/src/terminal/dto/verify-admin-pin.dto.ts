import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAdminPinDto {
  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'El PIN debe tener exactamente 6 dígitos' })
  pin!: string;
}