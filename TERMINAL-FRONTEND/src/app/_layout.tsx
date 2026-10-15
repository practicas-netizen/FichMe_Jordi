import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getToken } from '@/api/token-storage';
import { ActivationScreen } from '@/components/activation-screen';

import { AdminLoginScreen } from '@/components/admin-login-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PinTerminalScreen } from '@/components/pin-terminal-screen';
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context';
import { TerminalSettingsProvider, useTerminalSettings } from '@/context/terminal-settings-context';
import { I18nProvider } from '@/i18n/i18n-context';
import '../../global.css';

function RootFlow() {
  const { isAdminLoggedIn, isLoadingAuth } = useAdminAuth();
  const { settings, isLoadingSettings } = useTerminalSettings();

  const [hasToken, setHasToken] = useState<boolean | null>(null); // Null ya que no sabemos si es true (hay token) o false (no hay token).

  useEffect(() => {
    getToken()
      .then((token) => setHasToken(!!token))
      .catch(() => setHasToken(false));
  }, []);
  
  // Mientras cualquiera de las tres cosas sigue cargando desde el almacenamiento,
  // no mostramos nada todavía, para no ver un parpadeo del login antes de tiempo
  if (isLoadingAuth || isLoadingSettings || hasToken === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <Text className="text-slate-400">Cargando…</Text>
      </View>
    );
  }

  if (!hasToken) return <ActivationScreen onActivated={() => setHasToken(true)} />;
  if (!isAdminLoggedIn) return <AdminLoginScreen />;
  if (!settings.onboardingCompleted) return <OnboardingScreen />;
  return <PinTerminalScreen />;
}

export default function RootLayout() {
  return (
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