import { HttpException, HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { TimeEntry, TimeEntryType } from '../terminal/time-entry.entity';

const MAX_FAILED_ATTEMPTS = 5;      // fallos seguidos permitidos por tablet
const BLOCK_MS = 60_000;            // cuánto dura el bloqueo de la tablet (60 segundos)
const DUPLICATE_WINDOW_MS = 5_000;  // pulsaciones repetidas dentro de este margen en un solo fichaje

@Injectable()
export class TimeEntriesService {
  // Intentos fallidos por tablet. Está en memoria: se pierde al reiniciar el servidor.
  private failedAttempts = new Map<number, { count: number; blockedUntil: number }>();

  constructor(private dataSource: DataSource) {}

  async clock(
    deviceId: number,
    pin: string,
  ): Promise<{ name: string; type: TimeEntryType; clockedAt: Date }> {
    this.assertNotBlocked(deviceId);

    return this.dataSource.transaction(async (manager) => {
      // Bloquea la fila del empleado: dos peticiones del mismo empleado se ejecutan una detrás de otra
      const employee = await manager.findOne(Employee, {
        where: { pin, active: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!employee) {
        this.registerFailure(deviceId);
        throw new UnprocessableEntityException({
          statusCode: 422,
          code: 'EMPLOYEE_PIN_INVALID',
          message: 'PIN incorrecto',
        });
      }

      this.failedAttempts.delete(deviceId);

      const last = await manager.findOne(TimeEntry, {
        where: { employee: { id: employee.id } },
        order: { clockedAt: 'DESC', id: 'DESC' },
      });

      // No se crea otro fichaje, se responde con el que ya existe
      if (last && Date.now() - last.clockedAt.getTime() < DUPLICATE_WINDOW_MS) {
        return { name: employee.name, type: last.type, clockedAt: last.clockedAt };
      }

      // Si el último fue una entrada, ahora toca salida. Si no hay ninguno, entrada
      const type = last?.type === TimeEntryType.IN ? TimeEntryType.OUT : TimeEntryType.IN;

      const entry = manager.create(TimeEntry, {
        employee,
        terminalDevice: { id: deviceId },
        type,
        clockedAt: new Date(),
      });
      await manager.save(entry);

      return { name: employee.name, type, clockedAt: entry.clockedAt };
    });
  }

  // Mensaje que te sale al hacer muchos intentos fallidos
  private assertNotBlocked(deviceId: number) {
    const state = this.failedAttempts.get(deviceId);
    if (state && state.blockedUntil > Date.now()) {
      throw new HttpException(
        {
          statusCode: 429,
          code: 'TOO_MANY_PIN_ATTEMPTS',
          message: 'Demasiados intentos fallidos. Espera un momento.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private registerFailure(deviceId: number) {
    const state = this.failedAttempts.get(deviceId) ?? { count: 0, blockedUntil: 0 };

    // Si el bloqueo anterior ya terminó, se empieza a contar de cero
    if (state.blockedUntil && state.blockedUntil <= Date.now()) {
      state.count = 0;
      state.blockedUntil = 0;
    }

    state.count += 1;
    if (state.count >= MAX_FAILED_ATTEMPTS) {
      state.blockedUntil = Date.now() + BLOCK_MS;
    }
    this.failedAttempts.set(deviceId, state);
  }
}
