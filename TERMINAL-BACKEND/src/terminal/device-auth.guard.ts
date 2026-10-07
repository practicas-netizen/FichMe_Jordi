import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TerminalDevice, TerminalDeviceStatus } from './terminal-device.entity';
import { hashToken } from './token.util';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(TerminalDevice)
    private terminalDeviceRepository: Repository<TerminalDevice>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Saca la petición HTTP del contexto de Nest
    const request = context.switchToHttp().getRequest();

    // Lee la cabecera. Node la guarda en minúsculas
    const header: string | undefined = request.headers['authorization'];

    // Cubre "falta la cabecera" y "no empieza por Bearer "
    if (!header || !header.startsWith('Bearer ')) {
      throw this.invalidToken();
    }

    // Quita Bearer y los espacios sobrantes; si queda vacío, también es inválido
    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw this.invalidToken();
    }

    const device = await this.terminalDeviceRepository.findOne({
      where: { tokenHash: hashToken(token) },
    });

    if (!device) {
      throw this.invalidToken();
    }

    // tablet desvinculada
    if (device.status !== TerminalDeviceStatus.ACTIVE) {
        throw new ForbiddenException({
            statusCode: 403,
            code: 'DEVICE_REVOKED',
            message: 'Esta tablet ha sido desvinculada, actívala de nuevo',
        });
    }

    // registar la actividad de la tablet y dejarla en petición
    await this.terminalDeviceRepository.update(device.id, { lastSeenAt: new Date() });
    request.device = device;

    return true;
  }

  private invalidToken() {
    return new UnauthorizedException({
      statusCode: 401,
      code: 'DEVICE_TOKEN_INVALID',
      message: 'Token inválido o ausente',
    });
  }
}