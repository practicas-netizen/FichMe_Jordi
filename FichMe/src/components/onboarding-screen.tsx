import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useTerminalSettings, type DateFormatOption } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { isColorDark } from '@/utils/colors';

// Colores para elegir como fondo del terminal
const BACKGROUND_COLORS = ['#0F172A', '#1E293B', '#052E16', '#3B0764', '#7C2D12', '#FFFFFF', '#15243C', '#3A43A1'];
// Colores para elegir en los botones del teclado PIN
const PIN_BUTTON_COLORS = ['#2563EB', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0EA5E9'];

// Los 4 pasos del asistente, en orden. 'as const' le dice a TypeScript
// que esta lista no va a cambiar, así puede validar mejor los tipos
const STEPS = ['company', 'colors', 'pin', 'date'] as const;

export function OnboardingScreen() {
  const { settings, updateSettings, completeOnboarding } = useTerminalSettings();
  const { t } = useI18n();

  // stepIndex guarda en qué paso del 0 al 3 estamos ahora mismo
  const [stepIndex, setStepIndex] = useState(0);
  // step es el nombre del paso actual: 'company', 'colors', 'pin' o 'date'
  const step = STEPS[stepIndex];

  // Se ejecuta cuando el usuario toca el recuadro de "elegir logo"
  async function pickLogo() {
    // Primero hay que pedir permiso a Android/iOS para acceder a las fotos
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return; // si dice que no, no hacemos nada más

    // Abre la galería del celular para que el usuario elija una imagen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,       // comprime un poco la imagen para que no pese tanto
      allowsEditing: true, // deja recortarla
      aspect: [1, 1],      // fuerza que el recorte sea cuadrado
    });

    // Si el usuario no canceló y eligió una imagen, la guardamos en settings
    if (!result.canceled && result.assets[0]) {
      updateSettings({ logoUri: result.assets[0].uri });
    }
  }

  // Botón "Siguiente" / "Finalizar"
  function goNext() {
    if (stepIndex === STEPS.length - 1) {
      // Si ya estamos en el último paso (índice 3), en vez de avanzar,
      // marcamos el onboarding como completado y la app pasa al terminal
      completeOnboarding();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  // Botón "Atrás". Math.max(0, i - 1) evita que baje de 0 (no hay paso -1)
  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-6 py-4">
        <View className="flex-1">
          <Text className="mb-2 text-4xl font-bold text-slate-900 tracking-tight">{t('onboarding.title')}</Text>

          {/* Barra de progreso: una rayita por cada paso.
              Se pinta de azul si ya la pasamos (i <= stepIndex), gris si no */}
          <View className="mb-6 flex-row gap-2">
            {STEPS.map((s, i) => (
              <View
                key={s}
                className="h-1 flex-1 rounded-full"
                style={{ backgroundColor: i <= stepIndex ? '#2563EB' : '#E2E8F0' }}
              />
            ))}
          </View>

          <View className="flex-1 rounded-2xl bg-slate-200 p-6 mb-12">
            {/* Cada bloque "step === 'algo' && (...)" solo se muestra
                si estamos en ese paso exacto. Es como un interruptor */}
            {step === 'company' && (
              <View className="flex-1 ">
                <Text className="mb-1 text-sm text-slate-600">{t('onboarding.companyNameLabel')}</Text>
                <TextInput
                  value={settings.companyName}
                  onChangeText={(text) => updateSettings({ companyName: text })}
                  placeholder={t('onboarding.companyNamePlaceholder')}
                  className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-4 text-base"
                />

                <Pressable
                  onPress={pickLogo}
                  className="h-64 items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white">
                  {/* Si ya hay logo guardado, lo mostramos; si no, mostramos el texto del botón */}
                  {settings.logoUri ? (
                    <Image source={{ uri: settings.logoUri }} className="h-40 w-40 rounded-full" />
                  ) : (
                    <Text className="text-slate-500">{t('onboarding.logoButton')}</Text>
                  )}
                </Pressable>
                {settings.logoUri && (
                  <Pressable onPress={pickLogo} className="mt-2 items-center">
                    <Text className="text-sm text-blue-600">{t('onboarding.logoChange')}</Text>
                  </Pressable>
                )}
              </View>
            )}

            {step === 'colors' && (
              <View>
                <Text className="mb-3 text-sm text-slate-600">{t('onboarding.backgroundLabel')}</Text>
                <View className="mb-6 flex-row flex-wrap gap-3">
                  {/* Pintamos un círculo por cada color disponible */}
                  {BACKGROUND_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => updateSettings({ backgroundColor: color })}
                      className="h-14 w-14 rounded-full border-2 items-center justify-center"
                      style={{
                        backgroundColor: color,
                        // El círculo seleccionado tiene borde azul, los demás borde gris clarito
                        borderColor: settings.backgroundColor === color ? '#2563EB' : '#E2E8F0',
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
                <Text className="mb-3 text-sm text-slate-600">{t('onboarding.pinButtonLabel')}</Text>
                <View className="flex-row flex-wrap gap-3">
                  {PIN_BUTTON_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => updateSettings({ pinButtonColor: color })}
                      className="h-14 w-14 rounded-full border-2 items-center justify-center"
                      style={{
                        backgroundColor: color,
                        borderColor: settings.pinButtonColor === color ? '#0F172A' : '#E2E8F0',
                      }}
                    >
                      { settings.pinButtonColor === color && (
                        <Text style={{ color: isColorDark(color) ? '#FFFFFF' : '#0F172A' }}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {step === 'date' && (
              <View>
                <Text className="mb-3 text-sm text-slate-600">{t('onboarding.dateLabel')}</Text>
                {/* Dos opciones: fecha corta o larga */}
                {(['short', 'long'] as DateFormatOption[]).map((format) => (
                  <Pressable
                    key={format}
                    onPress={() => updateSettings({ dateFormat: format })}
                    className="mb-3 rounded-lg border bg-white px-4 py-3"
                    style={{
                      borderColor: settings.dateFormat === format ? '#2563EB' : '#CBD5E1',
                    }}>
                    <Text>{format === 'short' ? t('onboarding.dateShort') : t('onboarding.dateLong')}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Botones de navegación, siempre visibles abajo */}
        <View className="flex-row justify-between">
          <Pressable onPress={goBack} disabled={stepIndex === 0} className="px-4 py-3">
            {/* En el primer paso, el botón "Atrás" se ve semi-transparente (deshabilitado) */}
            <Text style={{ opacity: stepIndex === 0 ? 0.3 : 1 }}>{t('onboarding.back')}</Text>
          </Pressable>
          <Pressable onPress={goNext} className="rounded-lg bg-blue-600 px-6 py-3">
            <Text className="font-semibold text-white">
              {/* En el último paso el botón dice "Finalizar" en vez de "Siguiente" */}
              {stepIndex === STEPS.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}