import { useEffect, useState, useRef } from 'react';
import { Image, Pressable, Text, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTerminalSettings } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { isColorDark } from '@/utils/colors';
import { TerminalSettingsScreen } from '@/components/terminal-settings-screen';

const FAKE_PIN = '1234';
const PIN_LENGTH = 4;

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date, format: 'short' | 'long', locale: string) {
  if (format === 'short') return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US');
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function PinTerminalScreen() {
  const { settings } = useTerminalSettings();
  const { t, locale } = useI18n();
  const shake = useRef(new Animated.Value(0)).current;

  const [now, setNow] = useState(new Date());
  const [pin, setPin] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  function handleDigit(digit: string) {
    if (feedback !== 'idle') return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === PIN_LENGTH) {
      const success = nextPin === FAKE_PIN;
      setFeedback(success ? 'success' : 'error');
      if (!success) {
        Animated.sequence([
          Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 20, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -20, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
      }
      setTimeout(() => {
        setFeedback('idle');
        setPin('');
      }, 1200);
    }
  }

  function handleBackspace() {
    if (feedback !== 'idle') return;
    setPin((prev) => prev.slice(0, -1));
  }

  const isDark = isColorDark(settings.backgroundColor);
  const isPinButtonDark = isColorDark(settings.pinButtonColor);
  const pinTextColor = isPinButtonDark ? '#FFFFFF' : '#0F172A';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)';

  // Si showSettings es true, se muestra la pantalla de ajustes en vez del terminal.
  // Cuando el usuario pulse "Volver" ahí, onBack pone showSettings a false y volvemos aquí.
  if (showSettings) {
    return <TerminalSettingsScreen onBack={() => setShowSettings(false)} />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: settings.backgroundColor }}>
      <SafeAreaView className="flex-1 px-6 py-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {settings.logoUri && (
              <Image source={{ uri: settings.logoUri }} className="h-10 w-10 rounded-full" />
            )}
            <Text style={{ color: textColor }} className="text-lg font-bold">
              {settings.companyName || 'FichMe'}
            </Text>
          </View>

          {/* Botón de ajustes: pulsación normal, no hace falta mantener pulsado */}
          <Pressable
            onPress={() => setShowSettings(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="h-11 w-11 items-center justify-center rounded-full"
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.10)' }}>
              <Text style={{ color: textColor, fontSize: 20 }}>⚙</Text>
            </View>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text style={{ color: textColor }} className="text-6xl font-bold">
            {formatTime(now)}
          </Text>
          <Text style={{ color: mutedColor }} className="mt-2 text-base capitalize">
            {formatDate(now, settings.dateFormat, locale)}
          </Text>

          <Text style={{ color: mutedColor }} className="mb-4 mt-10 text-sm">
            {feedback === 'success' ? t('terminal.success') : feedback === 'error' ? t('terminal.error') : t('terminal.enterPin')}
          </Text>

          <Animated.View className="mb-8 flex-row gap-3" style={{ transform: [{ translateX: shake }] }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: feedback === 'error' ? '#DC2626' : feedback === 'success' ? '#46e607' : i < pin.length ? settings.pinButtonColor : mutedColor,
                }}
              />
            ))}
          </Animated.View>

          <View className="w-64 flex-row flex-wrap justify-center gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <Pressable key={digit} onPress={() => handleDigit(digit)} style={({ pressed }) => ({ opacity: pressed || feedback !== 'idle' ? 0.7 : 1 })}>
                <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: settings.pinButtonColor }}>
                  <Text style={{ color: pinTextColor, fontSize: 24, fontWeight: '700' }}>{digit}</Text>
                </View>
              </Pressable>
            ))}
            <View className="h-16 w-16" />
            <Pressable onPress={() => handleDigit('0')} style={({ pressed }) => ({ opacity: pressed || feedback !== 'idle' ? 0.7 : 1 })}>
              <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: settings.pinButtonColor }}>
                <Text style={{ color: pinTextColor, fontSize: 24, fontWeight: '700' }}>0</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={handleBackspace}
              className="h-16 w-16 items-center justify-center rounded-full"
              style={({ pressed }) => ({ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ color: textColor }} className="text-lg">⌫</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}