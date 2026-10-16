import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { deleteToken, getToken } from '@/api/token-storage';
import { ActivationScreen } from '@/components/activation-screen';
import { setOnUnauthorized } from '@/api/client';

import { AdminLoginScreen } from '@/components/admin-login-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PinTerminalScreen } from '@/components/pin-terminal-screen';
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context';
import { TerminalSettingsProvider, useTerminalSettings } from '@/context/terminal-settings-context';
import { I18nProvider, useI18n } from '@/i18n/i18n-context';
import '../../global.css';

function RootFlow() {
  const { isAdminLoggedIn, isLoadingAuth } = useAdminAuth();
  const { settings, isLoadingSettings, settingsLoadFailed, loadSettings } = useTerminalSettings();
  const { t } = useI18n();

  const [hasToken, setHasToken] = useState<boolean | null>(null); // Null ya que no sabemos si es true (hay token) o false (no hay token).

  useEffect(() => {
    getToken()
      .then((token) => setHasToken(!!token))
      .catch(() => setHasToken(false));
  }, []);

  useEffect(() => {
    setOnUnauthorized(async () => {
      try {
        await deleteToken();
      } catch {
        // si falla el borrado del token, igualmente volvemos a la activación
      } finally {
        setHasToken(false);
      }
    });
    return () => setOnUnauthorized(null);
  }, []);

  // Si hay token se leen los ajustes del servidor
  useEffect(() => {
    if (hasToken) loadSettings();
  }, [hasToken]);

  const loading = (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
      <Text className="text-slate-400">Cargando...</Text>
    </View>
  );

  // Primero se decide si hay un token o no y después se espera a los ajustes.
  // Si no hay se quedaria cargando todo el rato.
  if (isLoadingAuth || hasToken === null) return loading;
  if (!hasToken) return <ActivationScreen onActivated={() => setHasToken(true)} />;
  if (isLoadingSettings) return loading;

  if (settingsLoadFailed) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white px-6 dark:bg-slate-900">
        <Text className="text-center text-slate-600 dark:text-slate-300">{t('errors.settingsLoad')}</Text>
        <Pressable onPress={loadSettings} className="rounded-2xl bg-blue-600 px-6 py-3">
          <Text className="font-semibold text-white">{t('errors.retry')}</Text>
        </Pressable>
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