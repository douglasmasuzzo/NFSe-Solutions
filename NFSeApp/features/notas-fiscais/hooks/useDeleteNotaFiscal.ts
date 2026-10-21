import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export function useDeleteNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notas-fiscais/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
    },
  });
}
