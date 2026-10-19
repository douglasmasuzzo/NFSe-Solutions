import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { NotaFiscal, NotaFiscalSchema } from '../types/NotaFiscalSchema';
import { z } from 'zod';

const PaginatedSchema = z.object({
  data: z.array(NotaFiscalSchema),
  current_page: z.number(),
  last_page: z.number(),
});

export function useNotasFiscais() {
  return useQuery({
    queryKey: ['notas-fiscais'],
    queryFn: async (): Promise<NotaFiscal[]> => {
      const { data } = await api.get('/notas-fiscais');
      return PaginatedSchema.parse(data).data;
    },
  });
}
