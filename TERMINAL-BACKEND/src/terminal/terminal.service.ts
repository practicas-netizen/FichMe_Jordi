import { ConflictException, GoneException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { ActivationCode } from './activation-code.entity';
import { generateToken } from './token.util';
import { TerminalDevice, TerminalDeviceStatus } from './terminal-device.entity';
import { TerminalSettings } from './terminal-settings.entity';
import { UpdateSettingsDto } from './dto/update-settigs.dto';
import { SetAdminPinDto } from './dto/set-admin-pin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TerminalService {
  constructor(private dataSource: DataSource) {}

  async getSettings(deviceId: number) {
  const settings = await this.dataSource
    .getRepository(TerminalSettings)
    .findOne({ where: { deviceId } });

  if (!settings) {
    throw new NotFoundException({
      statusCode: 404,
      code: 'SETTINGS_NOT_FOUND',
      message: 'Configuración no encontrada',
    });
  }

  return {
    onboardingCompleted: settings.onboardingCompleted,
    companyName: settings.companyName,
    logoUri: settings.logo,
    backgroundColor: settings.backgroundColor,
    pinButtonColor: settings.pinButtonColor,
    dateFormat: settings.dateFormat,
  };
  }

  async updateSettings(deviceId: number, dto: UpdateSettingsDto) {
  const { logoUri, ...rest } = dto;
  const changes: Partial<TerminalSettings> = { ...rest };

  // La API usa logoUri, la entity usa logo
  if (logoUri !== undefined) {
    changes.logo = logoUri;
  }

  // Un update sin campos lanza error en TypeORM, y un PATCH vacío es válido
  if (Object.keys(changes).length > 0) {
    await this.dataSource
      .getRepository(TerminalSettings)
      .update({ deviceId }, changes);
  }

  return this.getSettings(deviceId);
  }

  private async getAdminPinHash(deviceId: number): Promise<string | null> {
  const device = await this.dataSource.getRepository(TerminalDevice).findOne({
    where: { id: deviceId },
    select: { id: true, adminPinHash: true },
  });
  return device?.adminPinHash ?? null;
  }

  private adminPinInvalid() {
    return new ForbiddenException({
      statusCode: 403,
      code: 'ADMIN_PIN_INVALID',
      message: 'PIN de administrador incorrecto',
    });
  }

  async setAdminPin(deviceId: number, dto: SetAdminPinDto): Promise<{ ok: true }> {
    const currentHash = await this.getAdminPinHash(deviceId);

    if (currentHash) {
      const valid = dto.currentPin ? await bcrypt.compare(dto.currentPin, currentHash) : false;
      if (!valid) throw this.adminPinInvalid();
    }

    const hash = await bcrypt.hash(dto.pin, 10);
    await this.dataSource.getRepository(TerminalDevice).update(deviceId, { adminPinHash: hash });
    return { ok: true };
  }

  async verifyAdminPin(deviceId: number, pin: string): Promise<{ valid: true }> {
    const currentHash = await this.getAdminPinHash(deviceId);

    if (!currentHash) {
      throw new ConflictException({
        statusCode: 409,
        code: 'ADMIN_PIN_NOT_SET',
        message: 'Esta tablet aún no tiene PIN de administrador',
      });
    }

    if (!(await bcrypt.compare(pin, currentHash))) throw this.adminPinInvalid();
    return { valid: true };
  }

  async activate(code: string): Promise<{ token: string }> {
    return this.dataSource.transaction(async (manager) => {
      const activationCode = await manager.findOne(ActivationCode, { where: { code } });

      if (!activationCode) {
        throw new NotFoundException({
          statusCode: 404,
          code: 'ACTIVATION_CODE_NOT_FOUND',
          message: 'Código no existente',
        });
      }

      if (activationCode.usedAt) {
        throw new ConflictException({
          statusCode: 409,
          code: 'ACTIVATION_CODE_USED',
          message: 'Código usado',
        });
      }

      if (activationCode.expiresAt && activationCode.expiresAt < new Date()) {
        throw new GoneException({
          statusCode: 410,
          code: 'ACTIVATION_CODE_EXPIRED',
          message: 'Código caducado',
        });
      }

      const { token, tokenHash } = generateToken();

      const device = manager.create(TerminalDevice, {
        tokenHash,
        status: TerminalDeviceStatus.ACTIVE,
      });
      await manager.save(device);

      const settings = manager.create(TerminalSettings, {
        deviceId: device.id,
      });
      await manager.save(settings);

      const result = await manager.update(
        ActivationCode,
        { id: activationCode.id, usedAt: IsNull() },
        { usedAt: new Date(), terminalDevice: device },
      );

      if (result.affected === 0) {
        throw new ConflictException({
          statusCode: 409,
          code: 'ACTIVATION_CODE_USED',
          message: 'Código usado',
        });
      }

      return { token };
    });
  }
}