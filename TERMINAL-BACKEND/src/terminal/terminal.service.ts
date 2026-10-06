import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ActivationCode } from './activation-code.entity';

@Injectable()
export class TerminalService {
  constructor(private dataSource: DataSource) {}

  async activate(code: string): Promise<ActivationCode> {
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

      return activationCode;
    });
  }
}