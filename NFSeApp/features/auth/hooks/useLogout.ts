import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import api from '@/services/api';
import { useAuth } from '../context/AuthContext';
import { clearToken } from '../utils/tokenStorage';

/**
 * Encerra a sessão: revoga o token no backend (POST /api/logout), limpa o
 * token salvo no dispositivo, zera o cache do React Query e volta para o
 * login. Falhas no backend não impedem o logout local (o token pode já ter
 * expirado — nesse caso o interceptor de 401 cuida disso).
 */
export function useLogout() {
  const { clearSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post('/logout');
      } catch {
        // Sem backend ou token já inválido: o logout local acontece mesmo assim.
      }
    },
    onSuccess: async () => {
      await clearToken();
      clearSession();
      queryClient.clear();
      router.replace('/login');
    },
  });
}
