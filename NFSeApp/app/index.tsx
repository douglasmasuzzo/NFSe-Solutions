import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Colors, Radius, Spacing } from '@/constants/Theme';

export default function HomeScreen() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFSe Solutions</Text>
      <Text style={styles.subtitle}>
        Gestão de notas fiscais de fornecedores — app Expo consumindo a API Laravel do projeto.
      </Text>

      {user && (
        <View style={styles.userBox}>
          <Text style={styles.userLabel}>Sessão ativa</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => router.push('/notas-fiscais')}>
        <Text style={styles.buttonText}>Ver notas fiscais</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.logoutButton, isPending && { opacity: 0.6 }]}
        onPress={() => logout()}
        disabled={isPending}
      >
        <Text style={styles.logoutButtonText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  userBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  userLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.placeholder,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  logoutButtonText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 15,
  },
});
