import React from 'react';
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
import { Redirect } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginValues } from '../types/AuthSchema';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius, Spacing } from '@/constants/Theme';

export function LoginScreen() {
  const { isAuthenticated, isReady } = useAuth();
  const { mutate, isPending, error, reset } = useLogin();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Erro do servidor: credenciais inválidas (422 { error: "..." })
  const serverError =
    error && axiosIsAxiosError(error)
      ? ((error.response?.data as { error?: string } | undefined)?.error ??
        'Não foi possível entrar. Tente novamente.')
      : null;

  function onSubmit(values: LoginValues) {
    reset(); // limpa erro anterior
    mutate(values, {
      onError: (err) => {
        if (axiosIsAxiosError(err) && err.response?.status === 422) {
          const message =
            (err.response.data as { error?: string } | undefined)?.error ??
            'Credenciais inválidas.';
          setError('email', { type: 'server', message });
        }
      },
    });
  }

  if (isReady && isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>NFSe Solutions</Text>
        <Text style={styles.subtitle}>
          Entre com seu usuário para gerenciar as notas fiscais.
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="test@example.com"
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
              placeholder="Sua senha"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
        {serverError && !errors.email && <Text style={styles.error}>{serverError}</Text>}

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={() => handleSubmit(onSubmit)()}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Acesso de teste: test@example.com / password
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// Evita importar axios só para isAxiosError neste arquivo.
function axiosIsAxiosError(error: unknown): error is import('axios').AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
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
  hint: {
    fontSize: 12,
    color: Colors.placeholder,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
