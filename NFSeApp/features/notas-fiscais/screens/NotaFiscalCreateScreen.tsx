import React, { useMemo } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { NotaFiscalForm } from '../components/NotaFiscalForm';
import { useCreateNotaFiscal } from '../hooks/useCreateNotaFiscal';
import { extractValidationErrors } from '../utils/apiErrors';
import { Colors } from '@/constants/Theme';

export function NotaFiscalCreateScreen() {
  const { mutate, isPending, error } = useCreateNotaFiscal();

  // Erros 422 do Laravel → mapeados por campo para o formulário exibir.
  const serverErrors = useMemo(() => extractValidationErrors(error), [error]);

  return (
    <View style={styles.container}>
      <NotaFiscalForm
        submitLabel="Cadastrar nota fiscal"
        isSubmitting={isPending}
        requireImage
        serverErrors={serverErrors}
        onSubmit={(values, imageUri) => {
          if (!imageUri) return;
          mutate(
            { values, imageUri },
            {
              onSuccess: () => router.back(),
              onError: (err) => {
                // Só avisa quando NÃO é erro de validação por campo (rede, 500).
                if (Object.keys(extractValidationErrors(err)).length === 0) {
                  Alert.alert(
                    'Erro',
                    'Não foi possível cadastrar a nota fiscal. Verifique sua conexão e tente novamente.'
                  );
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
});
