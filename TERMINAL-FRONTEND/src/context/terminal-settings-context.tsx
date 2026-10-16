import { createContext, useContext, useState, type ReactNode } from 'react';
import { getSettings, updateSettings as updateSettingsApi, type TerminalSettingsDto } from '@/api/api';

export type DateFormatOption = 'short' | 'long';

type TerminalSettings = TerminalSettingsDto;

type TerminalSettingsContextType = {
  settings: TerminalSettings;
  isLoadingSettings: boolean;
  settingsLoadFailed: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<TerminalSettings>) => void; // solo local: vista previa
  saveSettings: (partial: Partial<TerminalSettings>) => Promise<void>; // PATCH al servidor
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

const defaultSettings: TerminalSettings = {
  onboardingCompleted: false,
  companyName: '',
  logoUri: null,
  backgroundColor: '#0F172A',
  pinButtonColor: '#2563EB',
  dateFormat: 'long',
};

const TerminalSettingsContext = createContext<TerminalSettingsContextType | undefined>(undefined);

export function TerminalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TerminalSettings>(defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsLoadFailed, setSettingsLoadFailed] = useState(false);

  // Lee los ajustes del servidor. Se llama desde RootFlow cuando hay token.
  async function loadSettings() {
    setIsLoadingSettings(true);
    setSettingsLoadFailed(false);
    try {
      setSettings(await getSettings());
    } catch {
      setSettingsLoadFailed(true);
    } finally {
      setIsLoadingSettings(false);
    }
  }

  // Cambia solo el estado local (vista previa mientras se eligen colores, etc.).
  function updateSettings(partial: Partial<TerminalSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  // Envía los cambios al servidor y se queda con lo que este devuelve.
  // Si falla, el error sube a quien la llamó para que lo muestre.
  async function saveSettings(partial: Partial<TerminalSettings>) {
    const saved = await updateSettingsApi(partial);
    setSettings(saved);
  }

  async function completeOnboarding() {
    await saveSettings({ ...settings, onboardingCompleted: true });
  }

  async function resetOnboarding() {
    await saveSettings(defaultSettings);
  }

  return (
    <TerminalSettingsContext.Provider
      value={{
        settings,
        isLoadingSettings,
        settingsLoadFailed,
        loadSettings,
        updateSettings,
        saveSettings,
        completeOnboarding,
        resetOnboarding,
      }}>
      {children}
    </TerminalSettingsContext.Provider>
  );
}

export function useTerminalSettings() {
  const context = useContext(TerminalSettingsContext);
  if (!context) throw new Error('useTerminalSettings debe usarse dentro de TerminalSettingsProvider');
  return context;
}