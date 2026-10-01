import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AdminAuthContextType = {
  isAdminLoggedIn: boolean;
  companySlug: string;
  isLoadingAuth: boolean;
  login: (companySlug: string, password: string) => boolean;
  logout: () => void;
  verifyPassword: (password: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Credenciales de prueba — las sustituirá la validación real contra el backend de HR
const FAKE_COMPANY_SLUG = 'descanso';
const FAKE_ADMIN_PASSWORD = 'admin123';

const STORAGE_KEY = '@fichme/admin-session';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [companySlug, setCompanySlug] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

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
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, companySlug, isLoadingAuth, login, logout, verifyPassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  return context;
}