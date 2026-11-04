import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Produto, ProdutoSchema } from '../types/NotaFiscalSchema';
import { z } from 'zod';

/** Lista de produtos disponível para vincular à nota fiscal. */
export function useProdutos() {
  return useQuery({
    queryKey: ['produtos'],
    queryFn: async (): Promise<Produto[]> => {
      const { data } = await api.get('/produtos');
      return z.array(ProdutoSchema).parse(data);
    },
  });
}
