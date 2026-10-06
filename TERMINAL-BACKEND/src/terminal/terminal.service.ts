import { InjectRepository } from "@nestjs/typeorm";
import { ActivationCode } from "./activation-code.entity";
import { Repository } from "typeorm";
import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common'

@Injectable()

export class TerminalService {
    constructor (
        @InjectRepository(ActivationCode)
        private ActivationCodeRepository: Repository<ActivationCode>
    ) {}

    async activate(code: string): Promise<ActivationCode> {
        const activationCode = await this.ActivationCodeRepository.findOne({ where: { code } });

        if(!activationCode) {
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

        return(activationCode);
    }
    

}



