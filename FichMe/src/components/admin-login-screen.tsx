import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useI18n } from '@/i18n/i18n-context';
import { ThemeToggle } from '@/components/theme-toggle';

export function AdminLoginScreen() {
  const { login } = useAdminAuth();
  const { t, locale, setLocale } = useI18n();

  const [companySlug, setCompanySlug] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin() {
    const success = login(companySlug, password);
    setError(success ? '' : t('login.error'));
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <SafeAreaView className="flex-1 justify-center px-6">
        {/* Fila superior: idioma a la izquierda, tema a la derecha */}
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable onPress={() => setLocale(locale === 'es' ? 'en' : 'es')}>
            <Text className="text-sm text-blue-600 dark:text-blue-400">{locale === 'es' ? 'EN' : 'ES'}</Text>
          </Pressable>
          <ThemeToggle />
        </View>

        <Text className="mb-8 text-center text-5xl font-bold text-slate-900 tracking-tight dark:text-white">
          {t('login.title')}
        </Text>

        <View className="bg-slate-200 dark:bg-slate-800 rounded-2xl p-6">
          <Text className="mb-1 text-sm text-slate-600 dark:text-slate-300">{t('login.companyLabel')}</Text>
          <View className="mb-4 flex-row items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4">
            <TextInput
              value={companySlug}
              onChangeText={setCompanySlug}
              autoCapitalize="none"
              placeholder={t('login.companyPlaceholder')}
              placeholderTextColor="#94A3B8"
              className="flex-1 px-0 py-3 text-base text-slate-900 dark:text-white"
            />
            <Text className="text-sm text-slate-400">{t('login.companySuffix')}</Text>
          </View>

          <Text className="mb-1 text-sm text-slate-600 dark:text-slate-300">{t('login.passwordLabel')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={t('login.passwordPlaceholder')}
            placeholderTextColor="#94A3B8"
            className="mb-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 text-base"
          />

          {error ? <Text className="mb-4 text-red-500 dark:text-red-400">{error}</Text> : null}

          <Pressable onPress={handleLogin} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} className="mt-4 items-center rounded-2xl bg-blue-600 py-3">
            <Text className="font-semibold text-white">{t('login.submit')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}