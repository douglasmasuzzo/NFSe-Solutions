import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { resolveMediaUrl } from '@/services/mediaUrl';

// ---------------------------------------------------------------------------
// Item da nota (produto comprado): vinculado à nota na tabela
// nota_fiscal_produtos (quantidade + preço pago ao fornecedor).
// ---------------------------------------------------------------------------
export const ItemNotaSchema = z.object({
  produto_id: z.number().int().positive('Selecione um produto'),
  // `z.coerce` converte o texto digitado no input em número na validação.
  quantidade: z.coerce
    .number({ error: 'Informe a quantidade' })
    .int('Use um número inteiro')
    .min(1, 'Quantidade mínima: 1'),
  preco_compra: z.coerce
    .number({ error: 'Informe o preço de compra' })
    .min(0, 'O preço deve ser maior ou igual a zero'),
});
export type ItemNota = z.infer<typeof ItemNotaSchema>;

// ---------------------------------------------------------------------------
// Contrato de ENTRADA do formulário (o que o usuário preenche / escolhe).
// `id` é opcional porque na criação o registro ainda não existe — é esse o
// motivo de nunca precisar de um valor "fake" de id só para passar na
// validação (gambiarra vista no material de aula).
// ---------------------------------------------------------------------------
export const NotaFiscalFormSchema = z.object({
  id: z.number().int().positive().optional(),
  fornecedor_id: z
    .number({ error: 'Selecione um fornecedor' })
    .int()
    .positive('Selecione um fornecedor'),
  numero: z.string().min(1, 'Informe o número da nota'),
  dt_emissao: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD'),
  valor_total: z.coerce
    .number({ error: 'Informe o valor total' })
    .min(0, 'O valor deve ser maior ou igual a zero'),
  forma_pagamento: z.string().min(1, 'Informe a forma de pagamento'),
  observacoes: z.string().optional().nullable(),
  produtos: z.array(ItemNotaSchema).default([]),
});

export type NotaFiscalFormValues = z.infer<typeof NotaFiscalFormSchema>;

/**
 * Resolver do react-hook-form.
 *
 * `z.coerce` faz o tipo de ENTRADA do zod ser `unknown` (zod v4), enquanto o
 * useForm trabalha com o tipo de SAÍDA (número). Este cast documenta essa
 * transformação input → output aplicada pelo próprio zodResolver.
 */
export const notaFiscalResolver = zodResolver(
  NotaFiscalFormSchema
) as Resolver<NotaFiscalFormValues>;

// ---------------------------------------------------------------------------
// Contrato de SAÍDA — o que a API retorna (inclui relações e campos que o
// backend calcula). Os nomes aqui têm que bater exatamente com o Model
// Laravel (`preco_venda`, `imagem_nf_url`, etc.) — essa divergência de nomes
// foi justamente o bug visto no material de aula.
// ---------------------------------------------------------------------------
export const FornecedorSchema = z.object({
  id: z.number(),
  nome: z.string(),
  cnpj: z.string(),
});
export type Fornecedor = z.infer<typeof FornecedorSchema>;

export const ProdutoSchema = z.object({
  id: z.number(),
  nome: z.string(),
  preco_venda: z.number(),
});
export type Produto = z.infer<typeof ProdutoSchema>;

// Produto como aparece dentro de uma nota (com os dados do vínculo).
export const ProdutoDaNotaSchema = ProdutoSchema.extend({
  pivot: z.object({
    quantidade: z.number(),
    preco_compra: z.number(),
  }),
});
export type ProdutoDaNota = z.infer<typeof ProdutoDaNotaSchema>;

export const NotaFiscalSchema = NotaFiscalFormSchema.extend({
  id: z.number(),
  imagem_nf: z.string().nullable().optional(),
  // A API devolve a URL montada com APP_URL (localhost); o transform
  // reconstrói a URL com o IP real da API para abrir no celular.
  imagem_nf_url: z
    .string()
    .nullable()
    .optional()
    .transform((url) => resolveMediaUrl(url)),
  fornecedor: FornecedorSchema.optional(),
  produtos: z.array(ProdutoDaNotaSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type NotaFiscal = z.infer<typeof NotaFiscalSchema>;

export const FORMAS_PAGAMENTO = ['Boleto', 'Pix', 'Transferência', 'Dinheiro', 'Cartão'] as const;
