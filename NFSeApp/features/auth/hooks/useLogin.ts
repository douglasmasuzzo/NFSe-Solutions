import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuth } from '../context/AuthContext';
import { AuthUser, LoginValues } from '../types/AuthSchema';
import { saveToken } from '../utils/tokenStorage';

type LoginResponse = {
  token: string;
  user: AuthUser;
};

/**
 * Faz login na API (POST /api/login), guarda o token no SecureStore e
 * atualiza o contexto de autenticação.
 */
export function useLogin() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: async (values: LoginValues): Promise<LoginResponse> => {
      const { data } = await api.post<LoginResponse>('/login', values);
      return data;
    },
    onSuccess: async ({ token, user }) => {
      await saveToken(token);
      setSession(user);
    },
  });
}
