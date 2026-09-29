import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useI18n } from '@/i18n/i18n-context';

export function AdminLoginScreen() {
  // Sacamos la función login() de la "caja" de autenticación
  const { login } = useAdminAuth();
  // Sacamos la función de traducción y el control de idioma
  const { t, locale, setLocale } = useI18n();

  // Estas 3 variables solo existen mientras el usuario está en esta pantalla.
  // Cada una empieza vacía y se actualiza mientras el usuario escribe
  const [companySlug, setCompanySlug] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Se ejecuta cuando el usuario pulsa el botón "Iniciar sesión"
  function handleLogin() {
    const success = login(companySlug, password);
    // Si login() devolvió false, mostramos el mensaje de error;
    // si devolvió true, limpiamos cualquier error anterior (texto vacío = no se muestra nada)
    setError(success ? '' : t('login.error'));
  }

  return (
    // className="..." son clases de Tailwind: cada palabra es un estilo.
    // flex-1 = ocupa toda la pantalla, bg-slate-50 = gris muy claro
    <View className="flex-1 bg-slate-50">
      <SafeAreaView className="flex-1 justify-center px-6">
        {/* Botón arriba a la derecha para cambiar entre ES/EN */}
        <View className="mb-4 flex-row justify-end">
          <Pressable onPress={() => setLocale(locale === 'es' ? 'en' : 'es')}>
            <Text className="text-sm text-blue-600">{locale === 'es' ? 'EN' : 'ES'}</Text>
          </Pressable>
        </View>

        {/* t('login.title') busca el texto traducido, en vez de escribirlo fijo */}
        <Text className="mb-8 text-center text-5xl font-bold text-slate-900 tracking-tight">
          {t('login.title')}
        </Text>

        <View className="bg-slate-200 rounded-2xl p-6">

          {/* Campo del "enlace de empresa" */}
          <Text className="mb-1 text-sm text-slate-600">{t('login.companyLabel')}</Text>
          <View className="mb-4 flex-row items-center rounded-lg border border-slate-300 bg-white px-4">
            <TextInput
              value={companySlug}
              // Cada vez que el usuario teclea una letra, se llama esta función
              // con el texto nuevo, y actualizamos companySlug
              onChangeText={setCompanySlug}
              autoCapitalize="none" // evita que ponga mayúscula automática al empezar
              placeholder={t('login.companyPlaceholder')}
              className="flex-1 px-0 py-3 text-base"
            />
            <Text className="text-sm text-slate-400">{t('login.companySuffix')}</Text>
          </View>

          {/* Campo de contraseña */}
          <Text className="mb-1 text-sm text-slate-600">{t('login.passwordLabel')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry // oculta el texto con puntitos, típico de contraseñas
            placeholder={t('login.passwordPlaceholder')}
            className="mb-2 rounded-lg border border-slate-300 bg-white text-slate-900 px-4 py-3 text-base"
          />

          {/* Solo se muestra si error tiene texto dentro (no está vacío) */}
          {error ? <Text className="mb-4 text-red-500">{error}</Text> : null}

          <Pressable onPress={handleLogin} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} className="mt-4 items-center rounded-2xl bg-blue-600 py-3">
            <Text className="font-semibold text-white">{t('login.submit')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}