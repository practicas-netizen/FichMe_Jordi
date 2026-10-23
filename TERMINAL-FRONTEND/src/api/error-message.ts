import { ApiError, NetworkError } from './client';
import { LogoTooLargeError } from '@/utils/logo';

// Convierte cualquier error en un texto para el usuario.
// Recibe `t` como parámetro porque viene de un hook y aquí no se puede llamar.
export function getErrorMessage(e: unknown, t: (path: string) => string): string {
  if (e instanceof NetworkError) return t('errors.network');
  if (e instanceof LogoTooLargeError) return t('errors.logoTooLarge');

  if (e instanceof ApiError && e.code) {
    const key = `errors.${e.code}`;
    const text = t(key);
    // si no hay traducción para ese code, t() devuelve la propia clave
    if (text !== key) return text;
  }
  return t('errors.generic');
}
