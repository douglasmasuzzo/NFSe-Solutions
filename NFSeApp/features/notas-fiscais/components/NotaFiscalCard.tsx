import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { NotaFiscal } from '../types/NotaFiscalSchema';
import { Colors, Radius, Spacing } from '@/constants/Theme';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function NotaFiscalCard({ notaFiscal }: { notaFiscal: NotaFiscal }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/notas-fiscais/${notaFiscal.id}/edit`)}
      activeOpacity={0.8}
    >
      {notaFiscal.imagem_nf_url ? (
        <Image source={{ uri: notaFiscal.imagem_nf_url }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.thumbnailPlaceholderText}>Sem foto</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.numero}>NF {notaFiscal.numero}</Text>
        <Text style={styles.fornecedor} numberOfLines={1}>
          {notaFiscal.fornecedor?.nome ?? 'Fornecedor não informado'}
        </Text>
        <View style={styles.row}>
          <Text style={styles.valor}>{formatCurrency(notaFiscal.valor_total)}</Text>
          <Text style={styles.data}>{formatDate(notaFiscal.dt_emissao)}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notaFiscal.forma_pagamento}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => router.push(`/notas-fiscais/${notaFiscal.id}/delete`)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteButtonText}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  numero: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  fornecedor: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  valor: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  data: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginTop: Spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: 18,
  },
});
