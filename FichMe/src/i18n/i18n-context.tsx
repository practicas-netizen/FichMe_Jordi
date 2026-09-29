import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Locale } from './translations';

// Definimos qué forma tiene la "caja" de idioma:
// - locale: qué idioma está activo ahora mismo ('es' o 'en')
// - setLocale: función para cambiar el idioma
// - t: función para traducir un texto
type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
};

// Creamos la caja vacía. undefined = "todavía no tiene nada dentro"
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Función auxiliar: recibe un texto tipo 'login.title' y busca dentro
// del objeto de traducciones. El .split('.') convierte 'login.title'
// en ['login', 'title'], y luego vamos "bajando" nivel a nivel:
// primero busca translations.es.login, luego .title dentro de eso.
function getValueAtPath(obj: any, path: string): string {
  const value = path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  // Si no encuentra el texto (por error de escritura, etc.),
  // devolvemos la propia ruta como texto, para darnos cuenta del fallo
  return typeof value === 'string' ? value : path;
}

// Este componente "llena" la caja de datos y hace que todo lo que
// pongamos dentro de <I18nProvider>...</I18nProvider> pueda usar
// el idioma y la función t()
export function I18nProvider({ children }: { children: ReactNode }) {
  // Idioma por defecto: español
  const [locale, setLocale] = useState<Locale>('es');

  // t = "translate". Cada vez que una pantalla llama a t('login.title'),
  // esta función busca el texto correspondiente al idioma activo
  function t(path: string) {
    return getValueAtPath(translations[locale], path);
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// "Gancho" (hook) que usan las pantallas para acceder a la caja.
// En vez de escribir useContext(I18nContext) en cada pantalla,
// escribimos simplemente useI18n()
export function useI18n() {
  const context = useContext(I18nContext);
  // Si alguien usa useI18n() fuera de un <I18nProvider>, avisamos con un error claro
  if (!context) throw new Error('useI18n debe usarse dentro de I18nProvider');
  return context;
}