import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

const STORAGE_KEY = 'skill-tracker-admin-token';

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

interface AuthContextValue {
  isAdmin: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const apiBase = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const login = useCallback(async (password: string) => {
    const { data } = await axios.post<{ token: string }>(`${apiBase}/auth/login`, { password });
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
