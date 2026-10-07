import { IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetAdminPinDto {
  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'El PIN debe tener exactamente 6 dígitos' })
  pin!: string;

  @ApiPropertyOptional({ example: '654321', description: 'Obligatorio si ya hay un PIN definido' })
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'El PIN actual debe tener exactamente 6 dígitos' })
  currentPin?: string;
}