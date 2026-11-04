import { describe, expect, it } from 'vitest';
import {
  NotaFiscalFormSchema,
  NotaFiscalSchema,
} from './NotaFiscalSchema';

const formValido = {
  fornecedor_id: 1,
  numero: '000123',
  dt_emissao: '2026-10-13',
  valor_total: 150.5,
  forma_pagamento: 'Pix',
  observacoes: 'ok',
};

describe('NotaFiscalFormSchema (entrada do formulário)', () => {
  it('aceita um formulário válido e lista de itens vazia por padrão', () => {
    const result = NotaFiscalFormSchema.safeParse(formValido);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.produtos).toEqual([]);
  });

  it('aceita itens de produto válidos', () => {
    const result = NotaFiscalFormSchema.safeParse({
      ...formValido,
      produtos: [{ produto_id: 2, quantidade: 10, preco_compra: 6.5 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejeita formulário sem fornecedor', () => {
    const result = NotaFiscalFormSchema.safeParse({ ...formValido, fornecedor_id: 0 });
    expect(result.success).toBe(false);
  });

  it('rejeita data fora do formato AAAA-MM-DD', () => {
    const result = NotaFiscalFormSchema.safeParse({
      ...formValido,
      dt_emissao: '13/10/2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita valor total negativo', () => {
    const result = NotaFiscalFormSchema.safeParse({ ...formValido, valor_total: -1 });
    expect(result.success).toBe(false);
  });

  it('rejeita item com quantidade zero', () => {
    const result = NotaFiscalFormSchema.safeParse({
      ...formValido,
      produtos: [{ produto_id: 1, quantidade: 0, preco_compra: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it('converte texto digitado no input (coerce) para número', () => {
    const result = NotaFiscalFormSchema.safeParse({
      ...formValido,
      valor_total: '10,50'.replace(',', '.'),
      produtos: [{ produto_id: 1, quantidade: '3', preco_compra: '2,5'.replace(',', '.') }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.valor_total).toBe(10.5);
      expect(result.data.produtos[0].quantidade).toBe(3);
      expect(result.data.produtos[0].preco_compra).toBe(2.5);
    }
  });
});

describe('NotaFiscalSchema (saída da API)', () => {
  const notaDaApi = {
    ...formValido,
    id: 7,
    imagem_nf: 'notas-fiscais/foto.jpg',
    imagem_nf_url: 'http://localhost:8000/storage/notas-fiscais/foto.jpg',
    fornecedor: { id: 1, nome: 'Distribuidora', cnpj: '12.345.678/0001-01' },
    produtos: [
      {
        id: 2,
        nome: 'Coca-Cola 2L',
        preco_venda: 9.99,
        pivot: { quantidade: 10, preco_compra: 6.5 },
      },
    ],
  };

  it('aceita a resposta da API com relações', () => {
    const result = NotaFiscalSchema.safeParse(notaDaApi);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.produtos?.[0].pivot.quantidade).toBe(10);
      expect(result.data.fornecedor?.nome).toBe('Distribuidora');
    }
  });

  it('reconstrói a URL da foto para a origem da API (APP_URL localhost)', () => {
    const result = NotaFiscalSchema.safeParse(notaDaApi);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imagem_nf_url).not.toContain('localhost');
      expect(result.data.imagem_nf_url).toMatch(/^https?:\/\/[^/]+\/storage\/notas-fiscais\/foto\.jpg$/);
    }
  });

  it('mantém imagem nula quando a nota não tem foto', () => {
    const result = NotaFiscalSchema.safeParse({
      ...notaDaApi,
      imagem_nf: null,
      imagem_nf_url: null,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.imagem_nf_url).toBeNull();
  });
});
