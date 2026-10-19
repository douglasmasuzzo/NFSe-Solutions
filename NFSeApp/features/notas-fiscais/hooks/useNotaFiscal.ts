import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { NotaFiscal, NotaFiscalSchema } from '../types/NotaFiscalSchema';

export function useNotaFiscal(id?: string) {
  return useQuery({
    queryKey: ['notas-fiscais', id],
    queryFn: async (): Promise<NotaFiscal> => {
      const { data } = await api.get(`/notas-fiscais/${id}`);
      return NotaFiscalSchema.parse(data);
    },
    enabled: !!id,
  });
}
