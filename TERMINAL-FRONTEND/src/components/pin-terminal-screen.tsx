import { useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTerminalSettings } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { isColorDark } from '@/utils/colors';
import { TerminalSettingsScreen } from '@/components/terminal-settings-screen';
import { TerminalHeader } from '@/components/terminal/terminal-header';
import { TerminalClock } from '@/components/terminal/terminal-clock';
import { PinDots } from '@/components/terminal/pin-dots';
import { PinKeypad } from '@/components/terminal/pin-keypad';

const FAKE_PIN = '1234'; // credencial de prueba — la sustituirá la validación real del backend
const PIN_LENGTH = 4;

export function PinTerminalScreen() {
  const { settings } = useTerminalSettings();
  const { t, locale } = useI18n();
  const shake = useRef(new Animated.Value(0)).current;

  const [pin, setPin] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSettings, setShowSettings] = useState(false);

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

  if (showSettings) {
    return <TerminalSettingsScreen onBack={() => setShowSettings(false)} />;
  }

  const isDark = isColorDark(settings.backgroundColor);
  const isPinButtonDark = isColorDark(settings.pinButtonColor);
  const pinTextColor = isPinButtonDark ? '#FFFFFF' : '#0F172A';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)';
  const backspaceColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)';

  const feedbackMessage =
    feedback === 'success' ? t('terminal.success') : feedback === 'error' ? t('terminal.error') : t('terminal.enterPin');

  return (
    <View className="flex-1" style={{ backgroundColor: settings.backgroundColor }}>
      <SafeAreaView className="flex-1 px-6 py-6">
        <TerminalHeader
          companyName={settings.companyName}
          logoUri={settings.logoUri}
          textColor={textColor}
          isDark={isDark}
          onPressSettings={() => setShowSettings(true)}
        />

        <View className="flex-1 items-center justify-center">
          <TerminalClock dateFormat={settings.dateFormat} locale={locale} textColor={textColor} mutedColor={mutedColor} />

          <Text style={{ color: mutedColor }} className="mb-4 mt-10 text-sm">
            {feedbackMessage}
          </Text>

          <PinDots
            length={PIN_LENGTH}
            filledCount={pin.length}
            feedback={feedback}
            pinButtonColor={settings.pinButtonColor}
            mutedColor={mutedColor}
            shake={shake}
          />

          <PinKeypad
            disabled={feedback !== 'idle'}
            pinButtonColor={settings.pinButtonColor}
            pinTextColor={pinTextColor}
            backspaceColor={backspaceColor}
            textColor={textColor}
            onDigit={handleDigit}
            onBackspace={handleBackspace}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}