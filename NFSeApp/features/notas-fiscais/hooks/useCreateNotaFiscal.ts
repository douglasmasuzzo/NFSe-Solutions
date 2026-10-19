import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { NotaFiscalFormValues } from '../types/NotaFiscalSchema';
import { toFormData } from '../utils/toFormData';

export function useCreateNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      values,
      imageUri,
    }: {
      values: NotaFiscalFormValues;
      imageUri: string;
    }) => {
      const form = toFormData(values, imageUri);
      const { data } = await api.post('/notas-fiscais', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
    },
  });
}
