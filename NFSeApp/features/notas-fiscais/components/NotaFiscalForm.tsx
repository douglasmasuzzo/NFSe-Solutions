import React, { useEffect, useState } from 'react';
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
import { useForm, Controller, useFieldArray, FieldPath } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import {
  NotaFiscalFormValues,
  notaFiscalResolver,
  FORMAS_PAGAMENTO,
} from '../types/NotaFiscalSchema';
import { useFornecedores } from '../hooks/useFornecedores';
import { useProdutos } from '../hooks/useProdutos';
import { Colors, Radius, Spacing } from '@/constants/Theme';

type Props = {
  defaultValues?: Partial<NotaFiscalFormValues>;
  existingImageUrl?: string | null;
  requireImage?: boolean;
  submitLabel: string;
  isSubmitting: boolean;
  /** Erros de validação vindos do servidor (422), mapeados por campo. */
  serverErrors?: Record<string, string> | null;
  onSubmit: (values: NotaFiscalFormValues, imageUri?: string | null) => void;
};

export function NotaFiscalForm({
  defaultValues,
  existingImageUrl,
  requireImage = false,
  submitLabel,
  isSubmitting,
  serverErrors,
  onSubmit,
}: Props) {
  const { data: fornecedores, isLoading: loadingFornecedores } = useFornecedores();
  const { data: produtos, isLoading: loadingProdutos } = useProdutos();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<NotaFiscalFormValues>({
    resolver: notaFiscalResolver,
    defaultValues: {
      fornecedor_id: defaultValues?.fornecedor_id ?? undefined,
      numero: defaultValues?.numero ?? '',
      dt_emissao: defaultValues?.dt_emissao ?? '',
      valor_total: defaultValues?.valor_total ?? undefined,
      forma_pagamento: defaultValues?.forma_pagamento ?? '',
      observacoes: defaultValues?.observacoes ?? '',
      produtos: defaultValues?.produtos ?? [],
    },
  });

  // Itens da nota (produtos vinculados): useFieldArray guarda a lista dinâmica
  // dentro do próprio formulário (mesmo padrão do react-hook-form).
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'produtos',
  });

  // Exibe embaixo de cada campo as mensagens de erro do BACKEND (422),
  // além das validações locais feitas pelo zod.
  useEffect(() => {
    if (!serverErrors) return;
    Object.entries(serverErrors).forEach(([field, message]) => {
      setError(field as FieldPath<NotaFiscalFormValues>, {
        type: 'server',
        message,
      });
    });
  }, [serverErrors, setError]);

  const watchedProdutos = watch('produtos') ?? [];
  const somaItens = watchedProdutos.reduce(
    (total, item) =>
      total + (Number(item?.quantidade) || 0) * (Number(item?.preco_compra) || 0),
    0
  );

  function applyImageResult(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageError(null);
    }
  }

  // Câmera: captura a foto da nota fiscal com a câmera do próprio aparelho.
  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setImageError('Permissão de câmera negada. Libere o acesso nas configurações do aparelho.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    applyImageResult(result);
  }

  // Galeria: seleciona uma foto já existente no aparelho.
  async function pickFromGallery() {
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
    applyImageResult(result);
  }

  function toggleProduto(produtoId: number, precoVenda: number) {
    const index = fields.findIndex((field) => field.produto_id === produtoId);
    if (index >= 0) {
      remove(index);
    } else {
      append({ produto_id: produtoId, quantidade: 1, preco_compra: precoVenda });
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
  const selectedIds = fields.map((field) => field.produto_id);

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

      {/* ---------------- Itens da nota (produtos) ---------------- */}
      <Text style={styles.label}>Produtos da nota (opcional)</Text>
      <View style={styles.chipsRow}>
        {loadingProdutos && <ActivityIndicator color={Colors.primary} />}
        {produtos?.map((produto) => {
          const selected = selectedIds.includes(produto.id);
          return (
            <TouchableOpacity
              key={produto.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleProduto(produto.id, produto.preco_venda)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {selected ? '✓ ' : ''}
                {produto.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {fields.map((item, index) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>
              {produtos?.find((p) => p.id === item.produto_id)?.nome ?? 'Produto'}
            </Text>
            <TouchableOpacity onPress={() => remove(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.itemRemove}>Remover</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemRow}>
            <View style={styles.itemField}>
              <Text style={styles.itemFieldLabel}>Quantidade</Text>
              <Controller
                control={control}
                name={`produtos.${index}.quantidade`}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={styles.input}
                    value={String(value ?? '')}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={Colors.placeholder}
                  />
                )}
              />
              {errors.produtos?.[index]?.quantidade && (
                <Text style={styles.error}>{errors.produtos[index]?.quantidade?.message}</Text>
              )}
            </View>

            <View style={styles.itemField}>
              <Text style={styles.itemFieldLabel}>Preço de compra (R$)</Text>
              <Controller
                control={control}
                name={`produtos.${index}.preco_compra`}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={styles.input}
                    value={String(value ?? '')}
                    onChangeText={(text) => onChange(text.replace(',', '.'))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.placeholder}
                  />
                )}
              />
              {errors.produtos?.[index]?.preco_compra && (
                <Text style={styles.error}>{errors.produtos[index]?.preco_compra?.message}</Text>
              )}
            </View>
          </View>
        </View>
      ))}

      {fields.length > 0 && (
        <Text style={styles.itemsSum}>
          Soma dos itens: R$ {somaItens.toFixed(2).replace('.', ',')}
        </Text>
      )}

      {/* ---------------- Foto da nota fiscal ---------------- */}
      <Text style={styles.label}>Foto da nota fiscal</Text>
      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={pickFromCamera}>
          <Text style={styles.photoButtonText}>📷 Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
          <Text style={styles.photoButtonText}>🖼 Galeria</Text>
        </TouchableOpacity>
      </View>

      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.photoPreview} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>Nenhuma foto anexada ainda</Text>
        </View>
      )}
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
  itemCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  itemRemove: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemField: {
    flex: 1,
  },
  itemFieldLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  itemsSum: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    marginTop: Spacing.sm,
    textAlign: 'right',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  photoButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  photoPlaceholder: {
    height: 120,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  photoPlaceholderText: {
    color: Colors.textMuted,
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
