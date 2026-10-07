import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { ActivationCode } from './activation-code.entity';
import { generateToken } from './token.util';
import { TerminalDevice, TerminalDeviceStatus } from './terminal-device.entity';
import { TerminalSettings } from './terminal-settings.entity';

@Injectable()
export class TerminalService {
  constructor(private dataSource: DataSource) {}

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