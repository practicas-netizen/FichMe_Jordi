import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { hashToken } from '../terminal/token.util';

@Injectable()
export class AdminKeyGuard implements CanActivate {
    private adminKeyHash: Buffer;

    constructor(private configService: ConfigService) {
        const adminApiKey = this.configService.getOrThrow<string>('ADMIN_API_KEY');
        const hash = hashToken(adminApiKey);
        this.adminKeyHash = Buffer.from(hash, 'hex');
    }


    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const received = request.headers['x-admin-key'];

        if (typeof received !== 'string') {
            throw this.invalidKey();
        }

        const receivedHash = Buffer.from(hashToken(received), 'hex');

        if (!timingSafeEqual(receivedHash, this.adminKeyHash)) {
            throw this.invalidKey();
        }

        return true;
    }


    private invalidKey() {
        return new UnauthorizedException({
            statusCode: 401,
            code: 'ADMIN_KEY_INVALID',
            message: 'Clave de administración ausente o inválida',
        });
    }

}
