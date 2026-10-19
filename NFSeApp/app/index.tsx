import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFSe Solutions</Text>
      <Text style={styles.subtitle}>
        Gestão de notas fiscais de fornecedores — app Expo consumindo a API Laravel do projeto.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/notas-fiscais')}>
        <Text style={styles.buttonText}>Ver notas fiscais</Text>
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
});
