import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useTerminalSettings } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { BACKGROUND_COLORS, PIN_BUTTON_COLORS } from '@/constants/palette';
import { ColorField } from '@/components/color-field';
import { TerminalPreview } from '@/components/terminal-preview';

type Props = {
  onBack: () => void;
};

type Draft = {
  companyName: string;
  logoUri: string | null;
  backgroundColor: string;
  pinButtonColor: string;
};

export function TerminalSettingsScreen({ onBack }: Props) {
  const { companySlug, logout, verifyPassword } = useAdminAuth();
  const { settings, updateSettings, resetOnboarding } = useTerminalSettings();
  const { t } = useI18n();

  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Se toma una "foto" de la configuración real al montar la pantalla.
  // Todo lo que edites a partir de aquí vive en "draft", no en "settings",
  // hasta que lo guardes de verdad.
  const [draft, setDraft] = useState<Draft>({
    companyName: settings.companyName,
    logoUri: settings.logoUri,
    backgroundColor: settings.backgroundColor,
    pinButtonColor: settings.pinButtonColor,
  });

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

  async function pickLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      setDraft((prev) => ({ ...prev, logoUri: result.assets[0].uri }));
    }
  }

  function hasUnsavedChanges() {
    return (
      draft.companyName !== settings.companyName ||
      draft.logoUri !== settings.logoUri ||
      draft.backgroundColor !== settings.backgroundColor ||
      draft.pinButtonColor !== settings.pinButtonColor
    );
  }

  function handleSave() {
    updateSettings(draft);
    onBack();
  }

  function handleBackPress() {
    if (!hasUnsavedChanges()) {
      onBack();
      return;
    }

    Alert.alert(t('settings.unsavedTitle'), t('settings.unsavedMessage'), [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.discard'), style: 'destructive', onPress: onBack },
      { text: t('settings.saveAndExit'), onPress: handleSave },
    ]);
  }

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

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <SafeAreaView className="flex-1">
        {/*
          El ScrollView tiene exactamente 3 hijos directos. El del medio (índice 1) es la
          vista previa, y stickyHeaderIndices={[1]} hace que se quede fija arriba al bajar
          hasta los selectores de color, así siempre ves el resultado mientras eliges.
        */}
        <ScrollView
          stickyHeaderIndices={[1]}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}>
          {/* 0: título, nombre de empresa y logo */}
          <View className="pb-4">
            <Text className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
              {t('settings.title')}
            </Text>

            <Text className="mb-1 text-sm text-slate-600 dark:text-slate-300">
              {t('settings.companyNameLabel')}
            </Text>
            <TextInput
              value={draft.companyName}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, companyName: text }))}
              placeholder={t('onboarding.companyNamePlaceholder')}
              placeholderTextColor="#94A3B8"
              className="mb-6 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 text-base"
            />

            <Text className="mb-1 text-sm text-slate-600 dark:text-slate-300">
              {t('settings.logoLabel')}
            </Text>
            <Pressable
              onPress={pickLogo}
              className="mb-2 h-32 items-center justify-center rounded-lg border border-dashed border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-700">
              {draft.logoUri ? (
                <Image source={{ uri: draft.logoUri }} className="h-20 w-20 rounded-full" />
              ) : (
                <Text className="text-slate-500 dark:text-slate-300">{t('onboarding.logoButton')}</Text>
              )}
            </Pressable>
            {draft.logoUri && (
              <Pressable onPress={pickLogo} className="items-center">
                <Text className="text-sm text-blue-600 dark:text-blue-400">{t('settings.changeLogo')}</Text>
              </Pressable>
            )}
          </View>

          {/* 1: vista previa (fija). Lleva fondo propio para que lo que pasa por debajo no se vea */}
          <View className="bg-slate-50 pt-2 dark:bg-slate-900">
            <TerminalPreview
              backgroundColor={draft.backgroundColor}
              pinButtonColor={draft.pinButtonColor}
            />
          </View>

          {/* 2: colores, empresa y botones */}
          <View className="flex-1">
            <Text className="mb-3 text-sm text-slate-600 dark:text-slate-300">
              {t('settings.backgroundLabel')}
            </Text>
            <ColorField
              colors={BACKGROUND_COLORS}
              value={draft.backgroundColor}
              onChange={(color) => setDraft((prev) => ({ ...prev, backgroundColor: color }))}
              selectedBorderColor="#2563EB"
            />

            <Text className="mb-3 mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t('settings.pinButtonLabel')}
            </Text>
            <ColorField
              colors={PIN_BUTTON_COLORS}
              value={draft.pinButtonColor}
              onChange={(color) => setDraft((prev) => ({ ...prev, pinButtonColor: color }))}
              selectedBorderColor="#0F172A"
            />

            <Text className="mb-1 mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t('settings.companyLabel')}
            </Text>
            <Text className="mb-8 text-base text-slate-900 dark:text-white">
              {companySlug}.fichme.com
            </Text>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="mb-4 items-center rounded-2xl bg-blue-600 py-3">
              <Text className="font-semibold text-white">{t('settings.save')}</Text>
            </Pressable>

            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="mb-6 items-center rounded-lg border border-red-300 dark:border-red-800 py-3">
              <Text className="text-red-600 dark:text-red-400">{t('settings.resetButton')}</Text>
            </Pressable>

            <View className="mt-auto flex-row justify-between">
              <Pressable
                onPress={handleBackPress}
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}