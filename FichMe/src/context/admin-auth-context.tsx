import { createContext, useContext, useState, type ReactNode } from 'react';

type AdminAuthContextType = {
  isAdminLoggedIn: boolean;
  companySlug: string;
  login: (companySlug: string, password: string) => boolean;
  logout: () => void;
  verifyPassword: (password: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// CREDENCIALES DE PRUEBA — cuando conectes esto a un backend real,
// aquí es donde se hará la llamada a la API en vez de comparar con texto fijo
const FAKE_COMPANY_SLUG = 'descanso';
const FAKE_ADMIN_PASSWORD = 'admin123';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [companySlug, setCompanySlug] = useState('');

  function login(slug: string, password: string) {
    const isValid =
      slug.trim().toLowerCase() === FAKE_COMPANY_SLUG &&
      password === FAKE_ADMIN_PASSWORD;

    if (isValid) {
      setIsAdminLoggedIn(true);
      setCompanySlug(slug.trim().toLowerCase());
    }
    return isValid;
  }

  function logout() {
    setIsAdminLoggedIn(false);
  }

  // Vuelve a comprobar la contraseña, sin cerrar sesión ni tocar isAdminLoggedIn.
  // Usa la pantalla de ajustes para pedir la contraseña otra vez antes de entrar.
  function verifyPassword(password: string) {
    return password === FAKE_ADMIN_PASSWORD;
  }

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, companySlug, login, logout, verifyPassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  return context;
}