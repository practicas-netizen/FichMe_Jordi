import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminLoginScreen } from '@/components/admin-login-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PinTerminalScreen } from '@/components/pin-terminal-screen';
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context';
import { TerminalSettingsProvider, useTerminalSettings } from '@/context/terminal-settings-context';
import { I18nProvider } from '@/i18n/i18n-context';
import '../../global.css';
import { useEffect } from 'react';
import { request, ApiError, NetworkError } from '@/api/client';

function RootFlow() {
  const { isAdminLoggedIn, isLoadingAuth } = useAdminAuth();
  const { settings, isLoadingSettings } = useTerminalSettings();
  
  useEffect(() => {
  async function probe() {
    try {
      console.log('health:', await request<{ status: string }>('GET', '/health'));
    } catch (e) {
      console.log('health falló:', e instanceof ApiError ? [e.status, e.code] : e instanceof NetworkError ? 'red' : 'otro');
    }
    try {
      await request('GET', '/terminal/settings');
    } catch (e) {
      console.log('settings falló:', e instanceof ApiError ? [e.status, e.code] : e instanceof NetworkError ? 'red' : 'otro');
    }
  }
    probe();
  }, []);
  
  // Mientras cualquiera de las dos cosas sigue cargando desde el almacenamiento,
  // no mostramos nada todavía, para no ver un parpadeo del login antes de tiempo
  if (isLoadingAuth || isLoadingSettings) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <Text className="text-slate-400">Cargando…</Text>
      </View>
    );
  }

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