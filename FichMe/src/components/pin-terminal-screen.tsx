import { useEffect, useState, useRef } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useTerminalSettings } from '@/context/terminal-settings-context';
import { useI18n } from '@/i18n/i18n-context';
import { isColorDark } from '@/utils/colors';
import { Animated } from 'react-native';

//  PIN de prueba — más adelante esto vendrá de un backend real
const FAKE_PIN = '1234';
const PIN_LENGTH = 4;

// Convierte un objeto Date de JavaScript en texto tipo "14:32"
function formatTime(date: Date) {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Convierte la fecha en texto, corto ("22/09/2026") o largo ("martes, 22 de septiembre")
// según lo que se eligió en el onboarding
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
  const { logout } = useAdminAuth();
  const { t, locale } = useI18n();
  const shake = useRef(new Animated.Value(0)).current;

  const [now, setNow] = useState(new Date()); // la hora actual, se actualiza cada segundo
  const [pin, setPin] = useState('');          // los dígitos que el usuario ha ido tocando
  // Estado del "feedback": idle = esperando, success = PIN correcto, error = PIN incorrecto
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');

  // useEffect ejecuta código "efectos secundarios" fuera del flujo normal de pintar la pantalla.
  // Aquí lo usamos para crear un reloj: cada 1000ms (1 segundo) actualizamos "now"
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    // Esta función de "limpieza" se ejecuta si el componente desaparece de pantalla,
    // para parar el temporizador y no dejarlo corriendo en segundo plano para siempre
    return () => clearInterval(interval);
  }, []); // El array vacío [] significa "ejecuta esto solo una vez, al aparecer la pantalla"

  // Se llama cada vez que el usuario toca un número del teclado
  function handleDigit(digit: string) {
    if (feedback !== 'idle') return; // si ya estamos mostrando éxito/error, ignoramos toques
    const nextPin = pin + digit; // añadimos el nuevo dígito al final
    setPin(nextPin);

    // Cuando ya se completaron los 4 dígitos, comprobamos si es correcto
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
      // Después de 1.2 segundos, volvemos al estado normal y borramos el PIN escrito
      setTimeout(() => {
        setFeedback('idle');
        setPin('');
      }, 1200);
    }
  }

  // Botón de borrar (⌫): quita el último dígito escrito
  function handleBackspace() {
    if (feedback !== 'idle') return;
    setPin((prev) => prev.slice(0, -1)); // slice(0, -1) = "todo menos el último carácter"
  }

  const isDark = isColorDark(settings.backgroundColor);
  const isPinButtonDark = isColorDark(settings.pinButtonColor);
  const pinTextColor = isPinButtonDark ? '#FFFFFF' : '#0F172A';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)';

  return (
    // El fondo usa el color elegido en el onboarding (por eso va en "style", no en className:
    // Tailwind necesita clases fijas predefinidas, pero este color es dinámico/elegido por el usuario)
    <View className="flex-1" style={{ backgroundColor: settings.backgroundColor }}>
      <SafeAreaView className="flex-1 px-6 py-6">
        {/* onLongPress = mantener pulsado. Es el "acceso secreto" a ajustes:
            si mantienes pulsado el logo/nombre, se cierra sesión y vuelves al login */}
        <Pressable onLongPress={logout} className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {settings.logoUri && (
              <Image source={{ uri: settings.logoUri }} className="h-10 w-10 rounded-full" />
            )}
            <Text style={{ color: textColor }} className="text-lg font-bold">
              {settings.companyName || 'FichMe'}
              {/* Si companyName está vacío, "||" hace que se use 'FichMe' como respaldo */}
            </Text>
          </View>
          <Text style={{ color: mutedColor }} className="text-xs">
            {t('terminal.holdForSettings')}
          </Text>
        </Pressable>

        <View className="flex-1 items-center justify-center">
          {/* Reloj grande, se actualiza solo gracias al useEffect de arriba */}
          <Text style={{ color: textColor }} className="text-6xl font-bold">
            {formatTime(now)}
          </Text>
          <Text style={{ color: mutedColor }} className="mt-2 text-base capitalize">
            {formatDate(now, settings.dateFormat, locale)}
          </Text>

          {/* Mensaje que cambia según el estado: normal, éxito o error */}
          <Text style={{ color: mutedColor }} className="mb-4 mt-10 text-sm">
            {feedback === 'success' ? t('terminal.success') : feedback === 'error' ? t('terminal.error') : t('terminal.enterPin')}
          </Text>

          {/* Los 4 puntitos que muestran cuántos dígitos llevas escritos */}
          <Animated.View className="mb-8 flex-row gap-3" style={{ transform: [{ translateX : shake }] }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                className="h-3 w-3 rounded-full"
                style={{
                  // Rojo si hay error, del color elegido si ya se tocó ese dígito, gris si no
                  backgroundColor: feedback === 'error' ? '#DC2626' : feedback === 'success' ? '#46e607' : i < pin.length ? settings.pinButtonColor : mutedColor, 
                }}
              />
            ))}
          </Animated.View>

          {/* Teclado numérico: dibujamos los botones 1 al 9 con un bucle */}
          <View className="w-64 flex-row flex-wrap justify-center gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <Pressable key={digit} onPress={() => handleDigit(digit)} style={({ pressed }) => ({ opacity: pressed || feedback !== 'idle' ? 0.7 : 1 })}>
                <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: settings.pinButtonColor }}>
                  <Text style={{ color: pinTextColor, fontSize: 24, fontWeight: '700', }}>
                    {digit}
                  </Text>
                </View>
              </Pressable>
            ))}
            {/* Espacio vacío para que el 0 quede centrado en la última fila */}
            <View className="h-16 w-16" />
           <Pressable onPress={() => handleDigit('0')} style={({ pressed }) => ({ opacity: pressed || feedback !== 'idle' ? 0.7 : 1 })}>
              <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: settings.pinButtonColor }}>
                <Text style={{ color: pinTextColor, fontSize: 24, fontWeight: '700', }}>
                  0
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={handleBackspace}
              className="h-16 w-16 items-center justify-center rounded-full"
              style={({pressed}) => ({ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ color: textColor }} className="text-lg">⌫</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}