import { useCallback, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clock, type ClockResult } from '@/api/api';
import { ApiError } from '@/api/client';
import { getErrorMessage } from '@/api/error-message';
import { ClockConfirmationScreen } from '@/components/clock-confirmation-screen';
import { TerminalSettingsScreen } from '@/components/terminal-settings-screen';
import { PinDots } from '@/components/terminal/pin-dots';
import { PinKeypad } from '@/components/terminal/pin-keypad';
import { TerminalClock } from '@/components/terminal/terminal-clock';
import { TerminalHeader } from '@/components/terminal/terminal-header';
import { useTerminalSettings } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { isColorDark } from '@/utils/colors';

const PIN_LENGTH = 6;
const ERROR_FEEDBACK_MS = 1_500;

export function PinTerminalScreen() {
  const { settings } = useTerminalSettings();
  const { t, locale } = useI18n();
  const shake = useRef(new Animated.Value(0)).current;

  const [pin, setPin] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [clockResult, setClockResult] = useState<ClockResult | null>(null);

  const dismissClockConfirmation = useCallback(() => {
    setClockResult(null);
    setPin('');
    setFeedback('idle');
    setErrorMessage('');
  }, []);

  function shakeDots() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 20, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -20, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function sendPin(enteredPin: string) {
    setIsSending(true);
    setErrorMessage('');

    try {
      const result = await clock(enteredPin);
      setClockResult(result);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t));
      setFeedback('error');

      if (error instanceof ApiError && error.code === 'EMPLOYEE_PIN_INVALID') {
        shakeDots();
      }

      setTimeout(() => {
        setFeedback('idle');
        setErrorMessage('');
        setPin('');
      }, ERROR_FEEDBACK_MS);
    } finally {
      setIsSending(false);
    }
  }

  function handleDigit(digit: string) {
    if (feedback !== 'idle' || isSending) return;

    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === PIN_LENGTH) {
      void sendPin(nextPin);
    }
  }

  function handleBackspace() {
    if (feedback !== 'idle' || isSending) return;
    setPin((previous) => previous.slice(0, -1));
  }

  if (showSettings) {
    return <TerminalSettingsScreen onBack={() => setShowSettings(false)} />;
  }

  if (clockResult) {
    return (
      <ClockConfirmationScreen
        result={clockResult}
        onDone={dismissClockConfirmation}
      />
    );
  }

  const isDark = isColorDark(settings.backgroundColor);
  const isPinButtonDark = isColorDark(settings.pinButtonColor);
  const pinTextColor = isPinButtonDark ? '#FFFFFF' : '#0F172A';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)';
  const backspaceColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)';

  const feedbackMessage = isSending
    ? t('terminal.sending')
    : feedback === 'error'
      ? errorMessage
      : t('terminal.enterPin');

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
          <TerminalClock
            dateFormat={settings.dateFormat}
            locale={locale}
            textColor={textColor}
            mutedColor={mutedColor}
          />

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
            disabled={feedback !== 'idle' || isSending}
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