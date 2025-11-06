import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null; 
  setUser: (user: User | null) => void; 
  isAuthenticated: boolean; 
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user; 

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};