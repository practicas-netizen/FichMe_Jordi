import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useTerminalSettings } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { BACKGROUND_COLORS, PIN_BUTTON_COLORS } from '@/constants/palette';
import { ColorField } from '@/components/color-field';
import { TerminalPreview } from '@/components/terminal-preview';

type Props = {
  onBack: () => void;
};

export function TerminalSettingsScreen({ onBack }: Props) {
  const { companySlug, logout, verifyPassword } = useAdminAuth();
  const { settings, updateSettings, resetOnboarding } = useTerminalSettings();
  const { t } = useI18n();

  // Mientras unlocked sea false, se pide la contraseña antes de mostrar nada más
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleUnlock() {
    if (verifyPassword(password)) {
      setUnlocked(true);
      setError('');
    } else {
      setError(t('settings.wrongPassword'));
    }
  }

  function handleReset() {
    Alert.alert(t('settings.resetConfirmTitle'), t('settings.resetConfirmMessage'), [
      { text: t('settings.resetConfirmCancel'), style: 'cancel' },
      { text: t('settings.resetConfirmAccept'), style: 'destructive', onPress: resetOnboarding },
    ]);
  }

  // Pantalla 1: pedir la contraseña
  if (!unlocked) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-900">
        <SafeAreaView className="flex-1 justify-center px-6">
          <Text className="mb-8 text-center text-3xl font-bold text-slate-900 dark:text-white">
            {t('settings.lockedTitle')}
          </Text>

          <View className="bg-slate-200 dark:bg-slate-800 rounded-2xl p-6">
            <Text className="mb-1 text-sm text-slate-600 dark:text-slate-300">
              {t('settings.passwordLabel')}
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t('settings.passwordPlaceholder')}
              placeholderTextColor="#94A3B8"
              className="mb-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 text-base"
            />
            {error ? <Text className="mb-4 text-red-500 dark:text-red-400">{error}</Text> : null}

            <Pressable
              onPress={handleUnlock}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="mt-4 items-center rounded-2xl bg-blue-600 py-3">
              <Text className="font-semibold text-white">{t('settings.enter')}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onBack}
            className="mt-6 items-center"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Text className="text-slate-600 dark:text-slate-300">{t('settings.back')}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  // Pantalla 2: ajustes de verdad, una vez desbloqueada.
  // Va dentro de un ScrollView porque con los selectores de color abiertos ocupa más que la pantalla.
  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}>
          <Text className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
            {t('settings.title')}
          </Text>

          <TerminalPreview />

          <Text className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            {t('settings.backgroundLabel')}
          </Text>
          <ColorField
            colors={BACKGROUND_COLORS}
            value={settings.backgroundColor}
            onChange={(color) => updateSettings({ backgroundColor: color })}
            selectedBorderColor="#2563EB"
          />

          <Text className="mb-3 mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t('settings.pinButtonLabel')}
          </Text>
          <ColorField
            colors={PIN_BUTTON_COLORS}
            value={settings.pinButtonColor}
            onChange={(color) => updateSettings({ pinButtonColor: color })}
            selectedBorderColor="#0F172A"
          />

          <Text className="mb-1 mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t('settings.companyLabel')}
          </Text>
          <Text className="mb-8 text-base text-slate-900 dark:text-white">
            {companySlug}.fichme.com
          </Text>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="mb-6 items-center rounded-lg border border-red-300 dark:border-red-800 py-3">
            <Text className="text-red-600 dark:text-red-400">{t('settings.resetButton')}</Text>
          </Pressable>

          <View className="mt-auto flex-row justify-between">
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="px-4 py-3">
              <Text className="text-slate-900 dark:text-white">{t('settings.back')}</Text>
            </Pressable>
            <Pressable
              onPress={logout}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="rounded-lg bg-red-600 px-6 py-3">
              <Text className="font-semibold text-white">{t('settings.logout')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}