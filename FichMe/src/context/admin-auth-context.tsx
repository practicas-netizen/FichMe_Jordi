import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AdminAuthContextType = {
  isAdminLoggedIn: boolean;
  companySlug: string;
  isLoadingAuth: boolean; // true mientras se comprueba si ya había sesión guardada
  login: (companySlug: string, password: string) => boolean;
  logout: () => void;
  verifyPassword: (password: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// CREDENCIALES DE PRUEBA — cuando conectes esto a un backend real,
// aquí es donde se hará la llamada a la API en vez de comparar con texto fijo
const FAKE_COMPANY_SLUG = 'descanso';
const FAKE_ADMIN_PASSWORD = 'admin123';

// Clave con la que se guarda en AsyncStorage. Ponerle un prefijo (@fichme/)
// es una convención habitual para no chocar con claves de otras librerías.
const STORAGE_KEY = '@fichme/admin-session';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [companySlug, setCompanySlug] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Al arrancar la app, intenta leer una sesión guardada
  useEffect(() => {
    async function loadSession() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsAdminLoggedIn(true);
          setCompanySlug(parsed.companySlug);
        }
      } catch (e) {
        console.warn('No se pudo leer la sesión guardada', e);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    loadSession();
  }, []);

  function login(slug: string, password: string) {
    const cleanSlug = slug.trim().toLowerCase();
    const isValid = cleanSlug === FAKE_COMPANY_SLUG && password === FAKE_ADMIN_PASSWORD;

    if (isValid) {
      setIsAdminLoggedIn(true);
      setCompanySlug(cleanSlug);
      // Guarda la sesión para la próxima vez que se abra la app
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ companySlug: cleanSlug })).catch((e) =>
        console.warn('No se pudo guardar la sesión', e)
      );
    }
    return isValid;
  }

  function logout() {
    setIsAdminLoggedIn(false);
    AsyncStorage.removeItem(STORAGE_KEY).catch((e) => console.warn('No se pudo borrar la sesión', e));
  }

  function verifyPassword(password: string) {
    return password === FAKE_ADMIN_PASSWORD;
  }

  return (
    <AdminAuthContext.Provider
      value={{ isAdminLoggedIn, companySlug, isLoadingAuth, login, logout, verifyPassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  return context;
}