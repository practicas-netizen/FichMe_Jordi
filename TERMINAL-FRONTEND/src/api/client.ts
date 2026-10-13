import { getToken } from './token-storage';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error( 'Falta EXPO_PUBLIC_API_URL: créala en TERMINAL-FRONTEND/.env y reinicia con "npx expo start -c"' );
}

const REQUEST_TIMEOUT_MS = 10_000;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // fetch no tiene tiempo máximo: se cancela a mano pasado el plazo
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    // Sin respuesta: sin red, servidor caído o tiempo agotado
    throw new NetworkError('Sin conexión con el servidor');
  } finally {
    clearTimeout(timeoutId);
  }

  // El servidor puede responder algo que no sea JSON, y no debe romper el cliente
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const raw = (data ?? {}) as { code?: unknown; message?: unknown };
    const code = typeof raw.code === 'string' ? raw.code : undefined;
    // Los 400 de validación devuelven message como lista de textos
    const message = Array.isArray(raw.message)
      ? raw.message.join(', ')
      : typeof raw.message === 'string'
        ? raw.message
        : `Error ${response.status}`;
    throw new ApiError(response.status, message, code);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
};