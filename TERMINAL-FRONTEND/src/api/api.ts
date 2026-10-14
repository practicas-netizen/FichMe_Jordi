import type { DateFormatOption } from '@/context/terminal-settings-context';
import { api } from './client';

// GET /terminal/settings (terminal.service.ts)
export type TerminalSettingsDto = {
  onboardingCompleted: boolean;
  companyName: string;
  logoUri: string | null;
  backgroundColor: string;
  pinButtonColor: string;
  dateFormat: DateFormatOption;
};

// POST /time-entries
export type ClockResult = {
  name: string;
  type: 'in' | 'out';
  clockedAt: string; // las fechas viajan en JSON como texto ISO
};

// terminal.controller.ts -> activate
export const activateTerminal = (code: string) => api.post<{ token: string }>('/terminal/activate', { code });

// terminal.controller.ts -> getSettings
export const getSettings = () => api.get<TerminalSettingsDto>('/terminal/settings');

// terminal.controller.ts -> updateSettings
export const updateSettings = (changes: Partial<TerminalSettingsDto>) => api.patch<TerminalSettingsDto>('/terminal/settings', changes);

// terminal.controller.ts -> setAdminPin
export const setAdminPin = (pin: string, currentPin?: string) => api.post<{ ok: true }>('/terminal/admin-pin', { pin, currentPin });

// terminal.controller.ts -> verifyAdminPin
export const verifyAdminPin = (pin: string) => api.post<{ valid: true }>('/terminal/admin-pin/verify', { pin });

// time-entries.controller.ts -> clock
export const clock = (pin: string) => api.post<ClockResult>('/time-entries', { pin });