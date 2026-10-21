import { z } from 'zod';

// Contrato de ENTRADA do formulário (o que o usuário preenche / escolhe).
// `id` é opcional porque na criação o registro ainda não existe — é esse o
// motivo de nunca precisar de um valor "fake" de id só para passar na
// validação (gambiarra vista no material de aula).
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
});

export type NotaFiscalFormValues = z.infer<typeof NotaFiscalFormSchema>;

// Contrato de SAÍDA — o que a API retorna (inclui relações e campos que o
// backend calcula). Os nomes aqui têm que bater exatamente com o Model
// Laravel (`preco_venda`, `imagem_nf_url`, etc.) — essa divergência de nomes
// foi justamente o bug visto no material de aula.
export const FornecedorSchema = z.object({
  id: z.number(),
  nome: z.string(),
  cnpj: z.string(),
});
export type Fornecedor = z.infer<typeof FornecedorSchema>;

export const NotaFiscalSchema = NotaFiscalFormSchema.extend({
  id: z.number(),
  imagem_nf: z.string().nullable().optional(),
  imagem_nf_url: z.string().nullable().optional(),
  fornecedor: FornecedorSchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type NotaFiscal = z.infer<typeof NotaFiscalSchema>;

export const FORMAS_PAGAMENTO = ['Boleto', 'Pix', 'Transferência', 'Dinheiro', 'Cartão'] as const;
