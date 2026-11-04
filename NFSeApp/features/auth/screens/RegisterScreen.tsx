import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterValues } from '../types/AuthSchema';
import { useRegister } from '../hooks/useRegister';
import { useAuth } from '../context/AuthContext';
import { extractValidationErrors } from '@/features/notas-fiscais/utils/apiErrors';
import { Colors, Radius, Spacing } from '@/constants/Theme';

/**
 * Tela de cadastro de nova conta (POST /api/register).
 * Os nomes dos campos (name, email, password, password_confirmation) são os
 * mesmos aceitos pelo Laravel, então os erros 422 do servidor são exibidos
 * direto embaixo do campo certo.
 */
export function RegisterScreen() {
  const { isAuthenticated, isReady } = useAuth();
  const { mutate, isPending, error } = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  // Erros de validação do servidor (422) → campo a campo
  const serverErrors = useMemo(() => extractValidationErrors(error), [error]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
  });

  useEffect(() => {
    setFormError(null);
    Object.entries(serverErrors).forEach(([field, message]) => {
      setError(field as keyof RegisterValues, { type: 'server', message });
    });
    // Sem erros por campo (rede, servidor fora) → mensagem genérica
    if (error && Object.keys(serverErrors).length === 0) {
      setFormError('Não foi possível criar a conta. Verifique sua conexão e tente novamente.');
    }
  }, [serverErrors, error, setError]);

  if (isReady && isAuthenticated) {
    return <Redirect href="/" />;
  }

  function onSubmit(values: RegisterValues) {
    setFormError(null);
    mutate(values);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Preencha os dados abaixo para criar seu acesso ao NFSe Solutions.
        </Text>

        <Text style={styles.label}>Nome</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Seu nome"
              placeholderTextColor={Colors.placeholder}
              autoComplete="name"
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        <Text style={styles.label}>E-mail</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="voce@exemplo.com"
              placeholderTextColor={Colors.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Text style={styles.label}>Senha</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Mínimo de 8 caracteres"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        <Text style={styles.label}>Confirmar senha</Text>
        <Controller
          control={control}
          name="password_confirmation"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Digite a senha novamente"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry
            />
          )}
        />
        {errors.password_confirmation && (
          <Text style={styles.error}>{errors.password_confirmation.message}</Text>
        )}
        {formError && <Text style={styles.error}>{formError}</Text>}

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={() => handleSubmit(onSubmit)()}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/login')}>
          <Text style={styles.linkText}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 16,
    color: Colors.text,
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
