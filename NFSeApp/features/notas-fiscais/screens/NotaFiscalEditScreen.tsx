import React, { useMemo } from 'react';
import { Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { NotaFiscalForm } from '../components/NotaFiscalForm';
import { useNotaFiscal } from '../hooks/useNotaFiscal';
import { useUpdateNotaFiscal } from '../hooks/useUpdateNotaFiscal';
import { extractValidationErrors } from '../utils/apiErrors';
import { NotaFiscalFormValues } from '../types/NotaFiscalSchema';
import { Colors } from '@/constants/Theme';

export function NotaFiscalEditScreen({ id }: { id: string }) {
  const { data: notaFiscal, isLoading } = useNotaFiscal(id);
  const { mutate, isPending, error } = useUpdateNotaFiscal();

  const serverErrors = useMemo(() => extractValidationErrors(error), [error]);

  if (isLoading || !notaFiscal) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  // A API devolve os itens como produtos[] com pivot (quantidade/preço);
  // aqui convertemos de volta para o formato do formulário.
  const defaultValues: Partial<NotaFiscalFormValues> = {
    fornecedor_id: notaFiscal.fornecedor_id,
    numero: notaFiscal.numero,
    dt_emissao: notaFiscal.dt_emissao,
    valor_total: notaFiscal.valor_total,
    forma_pagamento: notaFiscal.forma_pagamento,
    observacoes: notaFiscal.observacoes,
    produtos: (notaFiscal.produtos ?? []).map((produto) => ({
      produto_id: produto.id,
      quantidade: produto.pivot.quantidade,
      preco_compra: produto.pivot.preco_compra,
    })),
  };

  return (
    <View style={styles.container}>
      <NotaFiscalForm
        submitLabel="Salvar alterações"
        isSubmitting={isPending}
        existingImageUrl={notaFiscal.imagem_nf_url}
        defaultValues={defaultValues}
        serverErrors={serverErrors}
        onSubmit={(values, imageUri) => {
          mutate(
            { id, values, imageUri },
            {
              onSuccess: () => router.back(),
              onError: (err) => {
                if (Object.keys(extractValidationErrors(err)).length === 0) {
                  Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
                }
              },
            }
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
