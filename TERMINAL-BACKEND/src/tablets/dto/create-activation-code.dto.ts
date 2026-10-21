import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateActivationCodeDto {
  @ApiPropertyOptional({
    example: 24,
    default: 24,
    minimum: 1,
    maximum: 720,
    description: 'Horas de validez del código desde que se crea. Por defecto 24.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720) // 30 días
  expiresInHours?: number;
}
