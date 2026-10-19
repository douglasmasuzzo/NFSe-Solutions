import React from 'react';
import { Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { NotaFiscalForm } from '../components/NotaFiscalForm';
import { useNotaFiscal } from '../hooks/useNotaFiscal';
import { useUpdateNotaFiscal } from '../hooks/useUpdateNotaFiscal';
import { Colors } from '@/constants/Theme';

export function NotaFiscalEditScreen({ id }: { id: string }) {
  const { data: notaFiscal, isLoading } = useNotaFiscal(id);
  const { mutate, isPending } = useUpdateNotaFiscal();

  if (isLoading || !notaFiscal) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotaFiscalForm
        submitLabel="Salvar alterações"
        isSubmitting={isPending}
        existingImageUrl={notaFiscal.imagem_nf_url}
        defaultValues={{
          fornecedor_id: notaFiscal.fornecedor_id,
          numero: notaFiscal.numero,
          dt_emissao: notaFiscal.dt_emissao,
          valor_total: notaFiscal.valor_total,
          forma_pagamento: notaFiscal.forma_pagamento,
          observacoes: notaFiscal.observacoes,
        }}
        onSubmit={(values, imageUri) => {
          mutate(
            { id, values, imageUri },
            {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.'),
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
