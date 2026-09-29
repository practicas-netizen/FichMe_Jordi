import { createContext, useContext, useState, type ReactNode } from 'react';

// El formato de fecha solo puede ser uno de estos dos valores
export type DateFormatOption = 'short' | 'long';

// Todo lo que se configura durante el onboarding vive aquí
type TerminalSettings = {
  onboardingCompleted: boolean; // ¿ya terminó de configurar el terminal?
  companyName: string;
  logoUri: string | null;       // null = todavía no eligió logo
  backgroundColor: string;      // color en formato hexadecimal, ej: '#0F172A'
  pinButtonColor: string;
  dateFormat: DateFormatOption;
};

type TerminalSettingsContextType = {
  settings: TerminalSettings;
  updateSettings: (partial: Partial<TerminalSettings>) => void; // "partial" = puedes actualizar solo algunos campos, no todos
  completeOnboarding: () => void;
};

// Valores con los que arranca la app la primera vez (antes de configurar nada)
const defaultSettings: TerminalSettings = {
  onboardingCompleted: false,
  companyName: '',
  logoUri: null,
  backgroundColor: '#0F172A', // azul oscuro por defecto
  pinButtonColor: '#2563EB',  // azul para los botones
  dateFormat: 'long',
};

const TerminalSettingsContext = createContext<TerminalSettingsContextType | undefined>(undefined);

export function TerminalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TerminalSettings>(defaultSettings);

  // Actualiza SOLO los campos que le pases, sin borrar el resto.
  // Ejemplo: updateSettings({ backgroundColor: '#FFFFFF' })
  // no toca companyName, logoUri, etc. — los conserva tal cual estaban
  function updateSettings(partial: Partial<TerminalSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
    // "...prev" copia todo lo que ya había, y "...partial" pisa
    // solo los campos nuevos que le pasaste
  }

  // Se llama al terminar el paso 4 del onboarding (pulsar "Finalizar")
  function completeOnboarding() {
    setSettings((prev) => ({ ...prev, onboardingCompleted: true }));
  }

  return (
    <TerminalSettingsContext.Provider value={{ settings, updateSettings, completeOnboarding }}>
      {children}
    </TerminalSettingsContext.Provider>
  );
}

export function useTerminalSettings() {
  const context = useContext(TerminalSettingsContext);
  if (!context) throw new Error('useTerminalSettings debe usarse dentro de TerminalSettingsProvider');
  return context;
}