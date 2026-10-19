import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import {
  NotaFiscalFormSchema,
  NotaFiscalFormValues,
  FORMAS_PAGAMENTO,
} from '../types/NotaFiscalSchema';
import { useFornecedores } from '../hooks/useFornecedores';
import { Colors, Radius, Spacing } from '@/constants/Theme';

type Props = {
  defaultValues?: Partial<NotaFiscalFormValues>;
  existingImageUrl?: string | null;
  requireImage?: boolean;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: NotaFiscalFormValues, imageUri?: string | null) => void;
};

export function NotaFiscalForm({
  defaultValues,
  existingImageUrl,
  requireImage = false,
  submitLabel,
  isSubmitting,
  onSubmit,
}: Props) {
  const { data: fornecedores, isLoading: loadingFornecedores } = useFornecedores();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NotaFiscalFormValues>({
    resolver: zodResolver(NotaFiscalFormSchema),
    defaultValues: {
      fornecedor_id: defaultValues?.fornecedor_id ?? undefined,
      numero: defaultValues?.numero ?? '',
      dt_emissao: defaultValues?.dt_emissao ?? '',
      valor_total: defaultValues?.valor_total ?? undefined,
      forma_pagamento: defaultValues?.forma_pagamento ?? '',
      observacoes: defaultValues?.observacoes ?? '',
    },
  });

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setImageError('Permissão de acesso às fotos foi negada.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageError(null);
    }
  }

  function handleFormSubmit(values: NotaFiscalFormValues) {
    if (requireImage && !imageUri && !existingImageUrl) {
      setImageError('Anexe uma foto da nota fiscal.');
      return;
    }
    onSubmit(values, imageUri);
  }

  const previewUri = imageUri ?? existingImageUrl ?? null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Fornecedor</Text>
      <Controller
        control={control}
        name="fornecedor_id"
        render={({ field: { value, onChange } }) => (
          <View style={styles.chipsRow}>
            {loadingFornecedores && <ActivityIndicator color={Colors.primary} />}
            {fornecedores?.map((fornecedor) => (
              <TouchableOpacity
                key={fornecedor.id}
                style={[styles.chip, value === fornecedor.id && styles.chipSelected]}
                onPress={() => onChange(fornecedor.id)}
              >
                <Text style={[styles.chipText, value === fornecedor.id && styles.chipTextSelected]}>
                  {fornecedor.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.fornecedor_id && <Text style={styles.error}>{errors.fornecedor_id.message}</Text>}

      <Text style={styles.label}>Número da nota</Text>
      <Controller
        control={control}
        name="numero"
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Ex: 000123"
            placeholderTextColor={Colors.placeholder}
          />
        )}
      />
      {errors.numero && <Text style={styles.error}>{errors.numero.message}</Text>}

      <Text style={styles.label}>Data de emissão (AAAA-MM-DD)</Text>
      <Controller
        control={control}
        name="dt_emissao"
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="2026-10-13"
            placeholderTextColor={Colors.placeholder}
          />
        )}
      />
      {errors.dt_emissao && <Text style={styles.error}>{errors.dt_emissao.message}</Text>}

      <Text style={styles.label}>Valor total (R$)</Text>
      <Controller
        control={control}
        name="valor_total"
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={styles.input}
            value={value?.toString() ?? ''}
            onChangeText={(text) => onChange(text.replace(',', '.'))}
            placeholder="0.00"
            placeholderTextColor={Colors.placeholder}
            keyboardType="decimal-pad"
          />
        )}
      />
      {errors.valor_total && <Text style={styles.error}>{errors.valor_total.message}</Text>}

      <Text style={styles.label}>Forma de pagamento</Text>
      <Controller
        control={control}
        name="forma_pagamento"
        render={({ field: { value, onChange } }) => (
          <View style={styles.chipsRow}>
            {FORMAS_PAGAMENTO.map((forma) => (
              <TouchableOpacity
                key={forma}
                style={[styles.chip, value === forma && styles.chipSelected]}
                onPress={() => onChange(forma)}
              >
                <Text style={[styles.chipText, value === forma && styles.chipTextSelected]}>{forma}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.forma_pagamento && <Text style={styles.error}>{errors.forma_pagamento.message}</Text>}

      <Text style={styles.label}>Observações (opcional)</Text>
      <Controller
        control={control}
        name="observacoes"
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="Alguma observação sobre esta nota..."
            placeholderTextColor={Colors.placeholder}
            multiline
          />
        )}
      />

      <Text style={styles.label}>Foto da nota fiscal</Text>
      <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoPickerText}>Toque para escolher uma foto</Text>
        )}
      </TouchableOpacity>
      {imageError && <Text style={styles.error}>{imageError}</Text>}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  photoPicker: {
    height: 160,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPickerText: {
    color: Colors.textMuted,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
