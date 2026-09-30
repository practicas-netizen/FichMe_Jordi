import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DateFormatOption = 'short' | 'long';

type TerminalSettings = {
  onboardingCompleted: boolean;
  companyName: string;
  logoUri: string | null;
  backgroundColor: string;
  pinButtonColor: string;
  dateFormat: DateFormatOption;
};

type TerminalSettingsContextType = {
  settings: TerminalSettings;
  isLoadingSettings: boolean;
  updateSettings: (partial: Partial<TerminalSettings>) => void;
  completeOnboarding: () => void;
};

const defaultSettings: TerminalSettings = {
  onboardingCompleted: false,
  companyName: '',
  logoUri: null,
  backgroundColor: '#0F172A',
  pinButtonColor: '#2563EB',
  dateFormat: 'long',
};

const STORAGE_KEY = '@fichme/terminal-settings';

const TerminalSettingsContext = createContext<TerminalSettingsContextType | undefined>(undefined);

export function TerminalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TerminalSettings>(defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Al arrancar, lee lo que hubiera guardado
  useEffect(() => {
    async function loadSettings() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setSettings(JSON.parse(saved));
      } catch (e) {
        console.warn('No se pudo leer la configuración guardada', e);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Cada vez que "settings" cambia y ya terminamos de cargar, lo guarda.
  // El "if (isLoadingSettings) return" evita que, nada más arrancar,
  // se sobrescriba lo guardado con los valores por defecto antes de leerlo.
  useEffect(() => {
    if (isLoadingSettings) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch((e) =>
      console.warn('No se pudo guardar la configuración', e)
    );
  }, [settings, isLoadingSettings]);

  function updateSettings(partial: Partial<TerminalSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  function completeOnboarding() {
    setSettings((prev) => ({ ...prev, onboardingCompleted: true }));
  }

  return (
    <TerminalSettingsContext.Provider
      value={{ settings, isLoadingSettings, updateSettings, completeOnboarding }}>
      {children}
    </TerminalSettingsContext.Provider>
  );
}

export function useTerminalSettings() {
  const context = useContext(TerminalSettingsContext);
  if (!context) throw new Error('useTerminalSettings debe usarse dentro de TerminalSettingsProvider');
  return context;
}