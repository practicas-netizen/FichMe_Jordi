import { getToken } from "./token-storage";

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
    throw new Error('Falta poner la variable EXPO_PUBLIC_API_URL en el .env');
}

const TIMEOUT_MS = 10000;

export async function request<T>(
  ruta: string,
  metodo: string,
  cuerpo?: unknown,
): Promise<T> {
  const token = await getToken();
  const cabeceras: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  let response: Response;
  try{
    response = await fetch(`${API_URL}${ruta}`, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
        signal: controlador.signal,
    });
  } catch {
    throw new NetworkError('Sin conexión con el servidor');
  } finally {
    clearTimeout(temporizador);
  }

  let datos: any = null;
  try {
    datos = await response.json();
  } catch {
    // null
  }

  if (!response.ok) {
    throw new ApiError(
        response.status,
        datos?.message ?? 'Error del servidor',
        datos?.code,
    );
  }
  return datos as T;
}

// Para que no escriban el método cada vez
export const get= <T>(ruta: string) => request<T>(ruta, 'GET');
export const post = <T>(ruta: string, cuerpo?: unknown) => request<T>(ruta, 'POST', cuerpo);
export const patch = <T>(ruta: string, cuerpo?: unknown) => request<T>(ruta, 'PATCH', cuerpo);