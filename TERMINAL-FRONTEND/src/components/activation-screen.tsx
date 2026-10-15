import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { activateTerminal } from '@/api/api';
import { ApiError, NetworkError } from '@/api/client';
import { setToken } from '@/api/token-storage';
import { ThemeToggle } from '@/components/theme-toggle';
import { useI18n } from '@/i18n/i18n-context';
import { getErrorMessage } from '@/api/error-message';

type Props = {
  onActivated: () => void; // la pantalla avisa a quien la usa cuando ya hay token guardado
};

export function ActivationScreen({ onActivated }: Props) {
  const { t, locale, setLocale } = useI18n();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Convierte cualquier error en un texto que el usuario entienda
  function getErrorMessage(e: unknown, t: (path: string) => string): string {
    if (e instanceof NetworkError) return t('errors.network');

    if (e instanceof ApiError && e.code) {
      const key = `errors.${e.code}`;
      const text = t(key);
      // si no hay traducción para ese code, t() devuelve la propia clave
      if (text !== key) return text;
    }
    return t('errors.generic');
  }

  async function handleActivate() {
    const cleanCode = code.trim();
    if (!cleanCode || isLoading) return;

    setIsLoading(true);
    setError('');
    try {
      const { token } = await activateTerminal(cleanCode);
      await setToken(token);
      onActivated();
    } catch (e) {
      setError(getErrorMessage(e, t));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <SafeAreaView className="flex-1 justify-center px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable onPress={() => setLocale(locale === 'es' ? 'en' : 'es')}>
            <Text className="text-sm text-blue-600 dark:text-blue-400">{locale === 'es' ? 'EN' : 'ES'}</Text>
          </Pressable>
          <ThemeToggle />
        </View>

        <Text className="mb-2 text-center text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('activation.title')}
        </Text>
        <Text className="mb-8 text-center text-slate-600 dark:text-slate-300">{t('activation.subtitle')}</Text>

        <View className="rounded-2xl bg-slate-200 p-6 dark:bg-slate-800">
          <Text className="mb-1 text-sm text-slate-600 dark:text-slate-300">{t('activation.codeLabel')}</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            onSubmitEditing={handleActivate}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            placeholder={t('activation.codePlaceholder')}
            placeholderTextColor="#94A3B8"
            className="mb-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />

          {error ? <Text className="mb-2 text-red-500 dark:text-red-400">{error}</Text> : null}

          <Pressable
            onPress={handleActivate}
            disabled={isLoading}
            style={({ pressed }) => [{ opacity: pressed || isLoading ? 0.7 : 1 }]}
            className="mt-4 items-center rounded-2xl bg-blue-600 py-3">
            <Text className="font-semibold text-white">{isLoading ? '…' : t('activation.submit')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}