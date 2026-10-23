import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

type Props = {
  dateFormat: 'short' | 'long';
  locale: string;
  textColor: string;
  mutedColor: string;
};

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

export function TerminalClock({ dateFormat, locale, textColor, mutedColor }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Poner la primera letra en mayúscula y las demás en minúscula
  const date = formatDate(now, dateFormat, locale);

  return (
    <View className="items-center">
      <Text style={{ color: textColor }} className="text-6xl font-bold">
        {formatTime(now)}
      </Text>
      <Text style={{ color: mutedColor }} className="mt-2 text-center text-base">
        {date.charAt(0).toUpperCase() + date.slice(1)}
      </Text>
    </View>
  );
}