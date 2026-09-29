import { createContext, useContext, useState, type ReactNode } from 'react';

// Forma de la caja: si está logueado o no, y las funciones para entrar/salir
type AdminAuthContextType = {
  isAdminLoggedIn: boolean;
  login: (companySlug: string, password: string) => boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ⚠️ CREDENCIALES DE PRUEBA — cuando conectes esto a un backend real,
// aquí es donde se hará la llamada a la API en vez de comparar con texto fijo
const FAKE_COMPANY_SLUG = 'descanso';
const FAKE_ADMIN_PASSWORD = 'admin123';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // false = "todavía no ha entrado nadie"
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Esta función la llama la pantalla de login cuando el usuario pulsa "Iniciar sesión"
  function login(companySlug: string, password: string) {
    // Comparamos lo que escribió el usuario con las credenciales fijas de arriba.
    // .trim() quita espacios accidentales al principio/final,
    // .toLowerCase() ignora si escribió mayúsculas o minúsculas
    const isValid =
      companySlug.trim().toLowerCase() === FAKE_COMPANY_SLUG &&
      password === FAKE_ADMIN_PASSWORD;

    // Si es correcto, actualizamos el estado a "logueado"
    if (isValid) setIsAdminLoggedIn(true);

    // Devolvemos true/false para que la pantalla de login sepa si mostrar error o no
    return isValid;
  }

  // Se usa cuando mantienes pulsado en el terminal para "salir" y volver al login
  function logout() {
    setIsAdminLoggedIn(false);
  }

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  return context;
}