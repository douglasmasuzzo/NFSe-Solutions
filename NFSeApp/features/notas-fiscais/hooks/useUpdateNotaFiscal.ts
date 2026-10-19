import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { NotaFiscalFormValues } from '../types/NotaFiscalSchema';
import { toFormData } from '../utils/toFormData';

export function useUpdateNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
      imageUri,
    }: {
      id: string;
      values: NotaFiscalFormValues;
      imageUri?: string | null;
    }) => {
      // PHP só faz o parsing de multipart/form-data em requisições POST —
      // numa requisição PUT "de verdade" com arquivo, o backend simplesmente
      // não recebe o arquivo. Por isso, quando há uma nova foto, enviamos um
      // POST com o campo "_method=PUT" (method spoofing nativo do Laravel),
      // em vez de um PUT real. Sem foto nova, um PUT comum com JSON é
      // suficiente e mais simples.
      if (imageUri) {
        const form = toFormData(values, imageUri);
        form.append('_method', 'PUT');
        const { data } = await api.post(`/notas-fiscais/${id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      }

      const { data } = await api.put(`/notas-fiscais/${id}`, values);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais', variables.id] });
    },
  });
}
