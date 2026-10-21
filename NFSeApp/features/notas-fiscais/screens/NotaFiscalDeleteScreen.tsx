import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useNotaFiscal } from '../hooks/useNotaFiscal';
import { useDeleteNotaFiscal } from '../hooks/useDeleteNotaFiscal';
import { Colors, Radius, Spacing } from '@/constants/Theme';

export function NotaFiscalDeleteScreen({ id }: { id: string }) {
  const { data: notaFiscal, isLoading } = useNotaFiscal(id);
  const { mutate, isPending } = useDeleteNotaFiscal();

  if (isLoading || !notaFiscal) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Excluir nota fiscal</Text>
      <Text style={styles.message}>
        Tem certeza que deseja excluir a NF {notaFiscal.numero} de{' '}
        {notaFiscal.fornecedor?.nome ?? 'fornecedor não informado'}? Essa ação não pode ser desfeita.
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        disabled={isPending}
        onPress={() =>
          mutate(id, {
            onSuccess: () => router.replace('/notas-fiscais'),
          })
        }
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>Confirmar exclusão</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: Spacing.lg },
  message: { fontSize: 15, color: Colors.textMuted, marginTop: Spacing.md, lineHeight: 22 },
  deleteButton: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  deleteButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: Spacing.md, padding: Spacing.sm },
  cancelButtonText: { color: Colors.textMuted, fontSize: 15 },
});
