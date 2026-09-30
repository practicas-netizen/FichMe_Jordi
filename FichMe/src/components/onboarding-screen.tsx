import { useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useTerminalSettings, type DateFormatOption } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { isColorDark } from '@/utils/colors';
import { ThemeToggle } from '@/components/theme-toggle';
import { BACKGROUND_COLORS, PIN_BUTTON_COLORS } from '@/constants/palette';
import { TerminalPreview } from '@/components/terminal-preview';

const STEPS = ['company', 'colors', 'pin', 'date'] as const;

export function OnboardingScreen() {
  const { settings, updateSettings, completeOnboarding } = useTerminalSettings();
  const { t } = useI18n();

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

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
      updateSettings({ logoUri: result.assets[0].uri });
    }
  }

  function goNext() {

    // Validación: si estamos en la pantalla de empresa, asegurarnos de que hay nombre y logo
    if (step === 'company' && (!settings.companyName || !settings.logoUri)) {
      Alert.alert(t('onboarding.missingFieldsTitle'), t('onboarding.missingFieldsMessage'));
      return;
    }

    if (stepIndex === STEPS.length - 1) {
      completeOnboarding();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <SafeAreaView className="flex-1 px-6 py-4">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-4xl font-bold text-slate-900 tracking-tight dark:text-white">{t('onboarding.title')}</Text>
            <ThemeToggle />
          </View>

          <View className="mb-6 flex-row gap-2">
            {STEPS.map((s, i) => (
              <View
                key={s}
                className="h-1 flex-1 rounded-full"
                style={{ backgroundColor: i <= stepIndex ? '#2563EB' : '#E2E8F0' }}
              />
            ))}
          </View>

          <View className="flex-1 rounded-2xl bg-slate-200 dark:bg-slate-800 p-6 mb-12">
            {step === 'company' && (
              <View className="flex-1">
                <Text className="mb-1 text-sm text-slate-600 dark:text-slate-300">{t('onboarding.companyNameLabel')}</Text>
                <TextInput
                  value={settings.companyName}
                  onChangeText={(text) => updateSettings({ companyName: text })}
                  placeholder={t('onboarding.companyNamePlaceholder')}
                  placeholderTextColor="#94A3B8"
                  className="mb-6 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-4 text-base"
                />

                <Pressable
                  onPress={pickLogo}
                  className="h-64 items-center justify-center rounded-lg border border-dashed border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-700">
                  {settings.logoUri ? (
                    <Image source={{ uri: settings.logoUri }} className="h-40 w-40 rounded-full" />
                  ) : (
                    <Text className="text-slate-500 dark:text-slate-300">{t('onboarding.logoButton')}</Text>
                  )}
                </Pressable>
                {settings.logoUri && (
                  <Pressable onPress={pickLogo} className="mt-2 items-center">
                    <Text className="text-sm text-blue-600 dark:text-blue-400">{t('onboarding.logoChange')}</Text>
                  </Pressable>
                )}
              </View>
            )}

            {step === 'colors' && (
              <View>
                <TerminalPreview />
                <Text className="mb-3 text-sm text-slate-600 dark:text-slate-300">{t('onboarding.backgroundLabel')}</Text>
                <View className="mb-6 flex-row flex-wrap gap-3">
                  {BACKGROUND_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => updateSettings({ backgroundColor: color })}
                      className="h-14 w-14 rounded-full border-2 items-center justify-center"
                      style={{
                        backgroundColor: color,
                        borderColor: settings.backgroundColor === color ? '#2563EB' : 'transparent',
                      }}
                    >
                      {settings.backgroundColor === color && (
                        <Text style={{ color: isColorDark(color) ? '#FFFFFF' : '#0F172A' }}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {step === 'pin' && (
              <View>
                <TerminalPreview />
                <Text className="mb-3 text-sm text-slate-600 dark:text-slate-300">{t('onboarding.pinButtonLabel')}</Text>
                <View className="flex-row flex-wrap gap-3">
                  {PIN_BUTTON_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => updateSettings({ pinButtonColor: color })}
                      className="h-14 w-14 rounded-full border-2 items-center justify-center"
                      style={{
                        backgroundColor: color,
                        borderColor: settings.pinButtonColor === color ? '#0F172A' : 'transparent',
                      }}
                    >
                      {settings.pinButtonColor === color && (
                        <Text style={{ color: isColorDark(color) ? '#FFFFFF' : '#0F172A' }}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {step === 'date' && (
              <View>
                <Text className="mb-3 text-sm text-slate-600 dark:text-slate-300">{t('onboarding.dateLabel')}</Text>
                {(['short', 'long'] as DateFormatOption[]).map((format) => (
                  <Pressable
                    key={format}
                    onPress={() => updateSettings({ dateFormat: format })}
                    className="mb-3 rounded-lg border bg-white dark:bg-slate-700 px-4 py-3"
                    style={{
                      borderColor: settings.dateFormat === format ? '#2563EB' : '#CBD5E1',
                    }}>
                    <Text className="text-slate-900 dark:text-white">
                      {format === 'short' ? t('onboarding.dateShort') : t('onboarding.dateLong')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        <View className="flex-row justify-between">
          <Pressable onPress={goBack} disabled={stepIndex === 0} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} className="px-4 py-3">
            <Text style={{ opacity: stepIndex === 0 ? 0.3 : 1 }} className="text-slate-900 dark:text-white">
              {t('onboarding.back')}
            </Text>
          </Pressable>
          <Pressable onPress={goNext} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} className="rounded-lg bg-blue-600 px-6 py-3">
            <Text className="font-semibold text-white">
              {stepIndex === STEPS.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}