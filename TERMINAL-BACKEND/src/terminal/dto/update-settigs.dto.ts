import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DateFormat } from '../terminal-settings.entity';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const isDefined = (_: unknown, value: unknown) => value !== undefined;

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'BridgeOne' })
  @ValidateIf(isDefined)
  @IsString()
  @MaxLength(120)
  companyName?: string;

  @ApiPropertyOptional({ example: '#0F172A' })
  @ValidateIf(isDefined)
  @Matches(HEX_COLOR, { message: 'backgroundColor debe ser un color hexadecimal (#RRGGBB)' })
  backgroundColor?: string;

  @ApiPropertyOptional({ example: '#2563EB' })
  @ValidateIf(isDefined)
  @Matches(HEX_COLOR, { message: 'pinButtonColor debe ser un color hexadecimal (#RRGGBB)' })
  pinButtonColor?: string;

  @ApiPropertyOptional({ enum: DateFormat })
  @ValidateIf(isDefined)
  @IsEnum(DateFormat, { message: 'dateFormat debe ser short o long' })
  dateFormat?: DateFormat;

  @ApiPropertyOptional()
  @ValidateIf(isDefined)
  @IsBoolean()
  onboardingCompleted?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1_500_000) // 1,1 MB de imagen en base64
  logoUri?: string | null;
}