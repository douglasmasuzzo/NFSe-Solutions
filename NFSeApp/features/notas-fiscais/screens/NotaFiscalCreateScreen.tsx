import React from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { NotaFiscalForm } from '../components/NotaFiscalForm';
import { useCreateNotaFiscal } from '../hooks/useCreateNotaFiscal';
import { Colors } from '@/constants/Theme';

export function NotaFiscalCreateScreen() {
  const { mutate, isPending } = useCreateNotaFiscal();

  return (
    <View style={styles.container}>
      <NotaFiscalForm
        submitLabel="Cadastrar nota fiscal"
        isSubmitting={isPending}
        requireImage
        onSubmit={(values, imageUri) => {
          if (!imageUri) return;
          mutate(
            { values, imageUri },
            {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert('Erro', 'Não foi possível cadastrar a nota fiscal. Verifique os dados e tente novamente.'),
            }
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
