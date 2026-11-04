import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '@/services/api';
import { setUnauthorizedHandler } from '@/services/api';
import { AuthUser } from '../types/AuthSchema';
import { clearToken, loadToken } from '../utils/tokenStorage';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** false enquanto tentamos restaurar o token salvo no dispositivo. */
  isReady: boolean;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const clearSession = useCallback(() => setUser(null), []);
  const setSession = useCallback((next: AuthUser) => setUser(next), []);

  // Restaura a sessão na abertura do app: lê o token salvo e o valida
  // consultando GET /api/user. Token inválido/expirado → limpa e pede login.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await loadToken();
      if (token) {
        try {
          const { data } = await api.get<AuthUser>('/user');
          if (!cancelled) setUser(data);
        } catch {
          await clearToken();
        }
      }
      if (!cancelled) setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Quando a API responde 401 (token revogado/expirado), o axios avisa aqui:
  // encerramos a sessão e o RequireAuth leva o usuário para a tela de login.
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearToken();
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isReady,
      setSession,
      clearSession,
    }),
    [user, isReady, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  }
  return context;
}
