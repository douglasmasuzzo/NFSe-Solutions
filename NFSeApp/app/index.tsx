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
  const { user, isAdmin } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFSe Solutions</Text>
      <Text style={styles.subtitle}>
        Gerencie as notas fiscais dos seus fornecedores: cadastre, consulte, edite ou exclua
        documentos.
      </Text>

      {user && (
        <View style={styles.userBox}>
          <Text style={styles.userLabel}>Sessão ativa</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[styles.roleBadge, user.role === 'admin' && styles.roleBadgeAdmin]}>
            <Text
              style={[styles.roleBadgeText, user.role === 'admin' && styles.roleBadgeTextAdmin]}
            >
              {user.role === 'admin' ? 'Administrador' : 'Usuário comum'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/notas-fiscais/new')}
        >
          <Text style={styles.buttonText}>Cadastrar nota fiscal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/notas-fiscais')}
        >
          <Text style={styles.secondaryButtonText}>Ver minhas notas fiscais</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.actionsHint}>
        {isAdmin
          ? 'Na lista, toque em uma nota para editar ou use o botão de exclusão.'
          : 'Na lista, toque em uma nota para visualizar e editar.'}
      </Text>

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
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginTop: Spacing.sm,
  },
  roleBadgeAdmin: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  roleBadgeTextAdmin: {
    color: '#fff',
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  actionsHint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.sm,
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
