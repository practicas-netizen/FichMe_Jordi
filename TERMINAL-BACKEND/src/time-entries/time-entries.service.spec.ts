import { DataSource } from "typeorm";
import { Employee } from "../employees/employee.entity";
import { TimeEntry, TimeEntryType } from "../terminal/time-entry.entity";
import { TimeEntriesService } from "./time-entries.service";
import { HttpException } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

const COMPANY_1 = 1;
const COMPANY_2 = 2;
const DEVICE_1 = 1;
const DEVICE_2 = 2;

const ANA = { id: 1, companyId: COMPANY_1, name: 'Ana Maria', pin: '123456', active: true } as Employee;
const LUIS = { id: 2, companyId: COMPANY_2, name: 'Luis Ernesto', pin: '123456', active: true } as Employee;
const MARTA = { id: 3, companyId: COMPANY_1, name: 'Marta Lopez', pin: '111111', active: false } as Employee;

type FindOptions = {
    where: { pin?: string; companyId?: number; active?: boolean; employee?: { id: number } };
};

function createService(employees: Employee[]) {
    const entries: TimeEntry[] = [];

    const manager = {
        findOne: async (entity: unknown, options: FindOptions) => {
            const { where } = options;
            if (entity === Employee) {
                return employees.find((e) => e.pin === where.pin && e.companyId === where.companyId && e.active === where.active) ?? null;
            }
            // Último fichaje del empleado
            return entries.filter((e) => e.employee.id === where.employee?.id).at(-1) ?? null;
        },
        create: (_entity: unknown, data: Partial<TimeEntry>) => ({ ...data }) as TimeEntry,
        save: async (entry: TimeEntry) => {
            entries.push(entry);
            return entry;
        },
    };

    const dataSource = {
        transaction: async <T>(callback: (m: typeof manager) => Promise<T>) => callback(manager),
    };

    const service = new TimeEntriesService(dataSource as unknown as DataSource);
    return { service, entries };
}

// Ejecuta algo que tiene que fallar y devuelve el error para mirar su código
async function getError(action: Promise<unknown>): Promise<HttpException> {
    try {
        await action;
    } catch (e) {
        return e as HttpException;
    }
    throw new Error('Tenia que fallar y no ha fallado');
}

// Teclea un PIN que no existe tantas veces como se pida
async function failTimes(service: TimeEntriesService, deviceId: number, times: number) {
    for (let i = 0; i < times; i++) {
        const error = await getError(service.clock(deviceId, COMPANY_1, '000000'));
        expect(error.getStatus()).toBe(422);
    }
}

describe('TimeEntriesService.clock', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-10-21T08:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('fichar', () => {
        it('la primera vez registra una entrada', async () => {
            const { service, entries } = createService([ANA]);

            const result = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);

            expect(result.name).toBe('Ana Maria');
            expect(result.type).toBe(TimeEntryType.IN);
            expect(entries).toHaveLength(1);
        });

        it('guarda desde qué tablet se ha fichado', async () => {
            const { service, entries } = createService([ANA]);

            await service.clock(DEVICE_2, COMPANY_1, ANA.pin);

            expect(entries[0].terminalDevice?.id).toBe(DEVICE_2);
        });

        it('alterna entrada y salida', async () => {
            const { service } = createService([ANA]);
            const types: TimeEntryType[] = [];

            for (let i = 0; i < 4; i++) {
                const result = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);
                types.push(result.type);
                jest.advanceTimersByTime(10_000);
            }
            expect(types).toEqual([TimeEntryType.IN, TimeEntryType.OUT, TimeEntryType.IN, TimeEntryType.OUT]);
        });

        it('si repite el PIN antes de 5 segundos devuelve el fichaje anterior sin crear otro', async () => {
            const { service, entries } = createService([ANA]);

            const first = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);
            jest.advanceTimersByTime(3_000);
            const second = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);

            expect(entries).toHaveLength(1);
            expect(second.type).toBe(first.type);
            expect(second.clockedAt).toBe(first.clockedAt);
        });

        it('a los 5 segundos ya cuenta como un fichaje nuevo', async () => {
            const { service, entries } = createService([ANA]);

            await service.clock(DEVICE_1, COMPANY_1, ANA.pin);
            jest.advanceTimersByTime(5_000);
            const second = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);

            expect(entries).toHaveLength(2);
            expect(second.type).toBe(TimeEntryType.OUT);
        });
    });

    describe('PIN incorrecto', () => {
        it('un PIN que no existe da EMPLOYEE_PIN_INVALID y no crea fichaje', async () => {
            const { service, entries } = createService([ANA]);

            const error = await getError(service.clock(DEVICE_1, COMPANY_1, '999999'));

            expect(error.getStatus()).toBe(422);
            expect(error.getResponse()).toMatchObject({ code: 'EMPLOYEE_PIN_INVALID' });
            expect(entries).toHaveLength(0);
        });

        it('un empleado dado de baja no puede fichar', async () => {
            const { service, entries } = createService([MARTA]);

            const error = await getError(service.clock(DEVICE_1, COMPANY_1, MARTA.pin));

            expect(error.getResponse()).toMatchObject({ code: 'EMPLOYEE_PIN_INVALID' });
            expect(entries).toHaveLength(0);
        });

        it('no ficha con el PIN de un empleado de otra empresa', async () => {
            const { service, entries } = createService([LUIS]);

            const error = await getError(service.clock(DEVICE_1, COMPANY_1, LUIS.pin));

            expect(error.getResponse()).toMatchObject({ code: 'EMPLOYEE_PIN_INVALID' });
            expect(entries).toHaveLength(0);
        });

        it('con el mismo PIN en dos empresas, cada tablet ficha al empleado de su empresa', async () => {
            const { service } = createService([ANA, LUIS]);

            const deAna = await service.clock(DEVICE_1, COMPANY_1, '123456');
            const deLuis = await service.clock(DEVICE_2, COMPANY_2, '123456');

            expect(deAna.name).toBe('Ana Maria');
            expect(deLuis.name).toBe('Luis Ernesto');
        });
    });

    describe('bloqueo por intentos', () => {
        it('bloquea la tablet tras 5 PIN incorrectos seguidos, aunque el siguiente sea correcto', async () => {
            const { service, entries } = createService([ANA]);

            await failTimes(service, DEVICE_1, 5);
            const error = await getError(service.clock(DEVICE_1, COMPANY_1, ANA.pin));

            expect(error.getStatus()).toBe(429);
            expect(error.getResponse()).toMatchObject({ code: 'TOO_MANY_PIN_ATTEMPTS' });
            expect(entries).toHaveLength(0);
        });

        it('con 4 fallos todavía no bloquea', async () => {
            const { service } = createService([ANA]);

            await failTimes(service, DEVICE_1, 4);
            const result = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);

            expect(result.type).toBe(TimeEntryType.IN);
        });

        it('pasados los 60 segundos se puede volver a fichar', async () => {
            const { service } = createService([ANA]);

            await failTimes(service, DEVICE_1, 5);
            jest.advanceTimersByTime(60_000);
            const result = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);

            expect(result.type).toBe(TimeEntryType.IN);
        });

        it('el bloqueo es solo de esa tablet', async () => {
            const { service } = createService([ANA, LUIS]);

            await failTimes(service, DEVICE_1, 5);
            const result = await service.clock(DEVICE_2, COMPANY_2, LUIS.pin);

            expect(result.name).toBe('Luis Ernesto');
        });

        it('un fichaje correcto reinicia el contador de fallos', async () => {
            const { service } = createService([ANA]);

            await failTimes(service, DEVICE_1, 4);
            await service.clock(DEVICE_1, COMPANY_1, ANA.pin);
            jest.advanceTimersByTime(10_000);
            await failTimes(service, DEVICE_1, 4);
            const result = await service.clock(DEVICE_1, COMPANY_1, ANA.pin);

            expect(result.type).toBe(TimeEntryType.OUT);
        });
    });
});