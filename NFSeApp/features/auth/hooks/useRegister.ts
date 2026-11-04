import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuth } from '../context/AuthContext';
import { AuthResponse, RegisterValues } from '../types/AuthSchema';
import { saveToken } from '../utils/tokenStorage';

/**
 * Cadastra um novo usuário (POST /api/register). O backend cria a conta com a
 * senha já criptografada e devolve o mesmo formato do login ({ token, user }),
 * então aproveitamos para salvar o token e iniciar a sessão na hora — o
 * usuário entra no app sem precisar logar de novo.
 */
export function useRegister() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: async (values: RegisterValues): Promise<AuthResponse> => {
      const { data } = await api.post<AuthResponse>('/register', values);
      return data;
    },
    onSuccess: async ({ token, user }) => {
      await saveToken(token);
      setSession(user);
    },
  });
}
