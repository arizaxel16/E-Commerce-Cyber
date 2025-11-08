// Ruta: frontend/src/context/AuthContext.tsx (¡Refactorizado para persistencia!)

import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
// ¡Importamos 'api' para hacer la llamada!
import api from '@/lib/api'; 

// La "forma" del usuario (igual que antes)
interface User {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

// La "forma" del Contexto (¡CON 'isLoading'!)
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean; // <-- ¡NUEVO! Para saber si estamos comprobando la sesión
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // <-- ¡NUEVO! Empezamos cargando
  
  const isAuthenticated = !!user;

  /**
   * ¡NUEVO! - Lógica de Persistencia de Sesión
   * Este 'useEffect' se ejecuta SOLO UNA VEZ cuando la app carga.
   */
  useEffect(() => {
    // Función asíncrona para comprobar la sesión
    const checkSession = async () => {
      try {
        // 1. Llamar al endpoint /me.
        //    (api.ts se encarga de enviar la cookie HttpOnly automáticamente)
        const response = await api.get<User>('/auth/me');

        // 2. Si tenemos éxito (200 OK), el backend nos devuelve los datos del usuario.
        if (response.data?.userId) {
          setUser(response.data); // ¡Iniciamos sesión!
        }
      } catch (error) {
        // 3. Si falla (401, 500, etc.), significa que no hay sesión.
        console.warn("No se encontró sesión válida.", error);
        setUser(null); // Nos aseguramos de que no haya usuario.
      } finally {
        // 4. Pase lo que pase, terminamos de cargar.
        setIsLoading(false);
      }
    };

    checkSession();
  }, []); // El array vacío '[]' asegura que esto solo se ejecute una vez

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// El hook 'useAuth' se queda igual
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};