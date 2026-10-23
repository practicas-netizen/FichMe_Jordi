import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivationCode } from "../terminal/activation-code.entity";
import { Repository } from "typeorm";
import { TerminalDevice, TerminalDeviceStatus } from "../terminal/terminal-device.entity";
import { CompaniesService } from "../companies/companies.service";
import { CreateActivationCodeDto } from "./dto/create-activation-code.dto";
import { ActivationCodeResponseDto } from "./dto/activation-code-response.dto";
import { isDuplicateEntry } from "../common/db-errors";
import { DeviceResponseDto } from "./dto/device-response.dto";
import { randomInt } from "node:crypto";

// Sin I, O, 0 ni 1 para que el código sea fácil de escribir sin confundirse
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_EXPIRES_IN_HOURS = 24;
const MAX_GENERATION_ATTEMPTS = 5;

@Injectable()
export class TabletsService {
    constructor(
        @InjectRepository(ActivationCode)
        private activationCodeRepository: Repository<ActivationCode>,
        @InjectRepository(TerminalDevice)
        private devicesRepository: Repository<TerminalDevice>,
        private companiesService: CompaniesService,
    ) { }

    async createActivationCode(companyId: number, dto: CreateActivationCodeDto): Promise<ActivationCodeResponseDto> {
        // Aqui se pone el error de 'COMPANY_NOT_FOUND' si la empresa no existe
        await this.companiesService.findOne(companyId);

        const hours = dto.expiresInHours ?? DEFAULT_EXPIRES_IN_HOURS;
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

        // La columna code es única (UK). Si por alguna casualidad se repite, se genera otro.
        for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            const code = this.generateCode();
            try {
                await this.activationCodeRepository.insert({ code, companyId, expiresAt });
                return { code, companyId, expiresAt };
            } catch (e) {
                if (!isDuplicateEntry(e)) throw e;
            }
        }

        throw new InternalServerErrorException({
            statusCode: 500,
            code: 'ACTIVATION_CODE_GENERATION_FAILED',
            message: 'No se ha podido generar un código único, inténtalo de nuevo',
        });
    }

    async findDevices(companyId: number): Promise<DeviceResponseDto[]> {
        await this.companiesService.findOne(companyId);

        // tokenHash y adminPinHash tienen "select:false", así que no salen en la consulta
        const devices = await this.devicesRepository.find({ where: { companyId }, order: { id: 'ASC' } });
        return devices.map((device) => this.toResponse(device));
    }

    async revokeDevice(id: number): Promise<DeviceResponseDto> {
        const device = await this.devicesRepository.findOne({ where: { id } });
        if (!device) {
            throw new NotFoundException({
                statusCode: 404,
                code: 'DEVICE_NOT_FOUND',
                message: 'Tablet no encontrada',
            });
        }

        // Si ya estaba revocada no se toca, ya que se conservaria la fecha original
        if (device.status === TerminalDeviceStatus.ACTIVE) {
            await this.devicesRepository.update(
                { id, status: TerminalDeviceStatus.ACTIVE },
                { status: TerminalDeviceStatus.REVOKED, revokedAt: new Date() },
            );
        }

        return this.toResponse(await this.devicesRepository.findOneOrFail({ where: { id } }));
    }

    private generateCode(): string {
        const chars = Array.from({ length: 8 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
        return `${chars.slice(0, 4)} - ${chars.slice(4)}`;
    }

    private toResponse(device: TerminalDevice): DeviceResponseDto {
        return {
            id: device.id,
            name: device.name,
            status: device.status,
            companyId: device.companyId,
            activatedAt: device.activatedAt,
            lastSeenAt: device.lastSeenAt,
            revokedAt: device.revokedAt,
        };
    }
}