import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminLoginScreen } from '@/components/admin-login-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PinTerminalScreen } from '@/components/pin-terminal-screen';
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context';
import { TerminalSettingsProvider, useTerminalSettings } from '@/context/terminal-settings-context';
import { I18nProvider } from '@/i18n/i18n-context';

// Esta línea activa Tailwind en toda la app — sin ella, className="..." no haría nada
import '../../global.css';

// Este componente decide QUÉ pantalla mostrar, leyendo las "cajas" de datos.
// Se llama RootFlow porque literalmente controla el flujo/recorrido de la app
function RootFlow() {
  const { isAdminLoggedIn } = useAdminAuth();
  const { settings } = useTerminalSettings();

  // El orden de estas comprobaciones importa: primero preguntamos login,
  // luego onboarding, y si ambas pasan, mostramos el terminal
  if (!isAdminLoggedIn) return <AdminLoginScreen />;
  if (!settings.onboardingCompleted) return <OnboardingScreen />;
  return <PinTerminalScreen />;
}

// Este es el punto de arranque de TODA la app (Expo Router lo carga siempre primero).
// Aquí "envolvemos" la app con todos los Providers (las cajas de datos),
// para que RootFlow y las pantallas que muestre puedan usar useAdminAuth(), etc.
export default function RootLayout() {
  return (
    // SafeAreaProvider evita que el contenido quede tapado por la barra de estado
    // del celular (hora, batería) o el "notch" de la cámara
    <SafeAreaProvider>
      <I18nProvider>
        <AdminAuthProvider>
          <TerminalSettingsProvider>
            <RootFlow />
          </TerminalSettingsProvider>
        </AdminAuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}