import { QueryFailedError } from 'typeorm';

// true si MySQL rechazó la operación por un valor duplicado en una clave UNIQUE
export function isDuplicateEntry(e: unknown): boolean {
    return e instanceof QueryFailedError && e.driverError?.code === 'ER_DUP_ENTRY';
}