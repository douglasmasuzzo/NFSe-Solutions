import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { NotaFiscal, NotaFiscalSchema } from '../types/NotaFiscalSchema';
import { z } from 'zod';

const PaginatedSchema = z.object({
  data: z.array(NotaFiscalSchema),
  current_page: z.number(),
  last_page: z.number(),
});
export type PaginatedNotas = z.infer<typeof PaginatedSchema>;

const PER_PAGE = 15;

/**
 * Lista paginada de notas fiscais.
 *
 * Usa useInfiniteQuery (TanStack Query): cada página vai para o cache sob a
 * MESMA queryKey ['notas-fiscais'], `getNextPageParam` devolve a próxima
 * página enquanto `current_page < last_page` e a tela mostra o botão
 * "Carregar mais" — assim nenhuma nota fica escondida após a 1ª página.
 */
export function useNotasFiscais() {
  return useInfiniteQuery({
    queryKey: ['notas-fiscais'],
    queryFn: async ({ pageParam }): Promise<PaginatedNotas> => {
      const { data } = await api.get('/notas-fiscais', {
        params: { page: pageParam, per_page: PER_PAGE },
      });
      return PaginatedSchema.parse(data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
  });
}

/** Achata todas as páginas já carregadas em uma única lista. */
export function flattenNotas(
  data: InfiniteData<PaginatedNotas> | undefined
): NotaFiscal[] {
  return data?.pages.flatMap((page) => page.data) ?? [];
}
