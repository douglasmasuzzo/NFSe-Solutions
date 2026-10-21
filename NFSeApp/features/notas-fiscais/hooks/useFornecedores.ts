import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Fornecedor, FornecedorSchema } from '../types/NotaFiscalSchema';
import { z } from 'zod';

export function useFornecedores() {
  return useQuery({
    queryKey: ['fornecedores'],
    queryFn: async (): Promise<Fornecedor[]> => {
      const { data } = await api.get('/fornecedores');
      return z.array(FornecedorSchema).parse(data);
    },
  });
}
