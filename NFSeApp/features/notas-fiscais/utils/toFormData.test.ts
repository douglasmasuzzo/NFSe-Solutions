import { beforeAll, describe, expect, it } from 'vitest';
import { toFormData } from './toFormData';
import { NotaFiscalFormValues } from '../types/NotaFiscalSchema';

// Substitui o FormData do Node por um coletor simples para inspecionar o que
// seria enviado (o FormData do React Native tem comportamento equivalente).
class FakeFormData {
  entries: Array<[string, unknown]> = [];
  append(key: string, value: unknown) {
    this.entries.push([key, value]);
  }
  get(key: string) {
    return this.entries.find(([k]) => k === key)?.[1];
  }
  getAll(key: string) {
    return this.entries.filter(([k]) => k === key).map(([, v]) => v);
  }
}

beforeAll(() => {
  Object.defineProperty(globalThis, 'FormData', {
    value: FakeFormData,
    writable: true,
    configurable: true,
  });
});

const valores: NotaFiscalFormValues = {
  fornecedor_id: 3,
  numero: '000456',
  dt_emissao: '2026-11-04',
  valor_total: 99.9,
  forma_pagamento: 'Boleto',
  observacoes: 'entrega ok',
  produtos: [
    { produto_id: 1, quantidade: 2, preco_compra: 10.5 },
    { produto_id: 5, quantidade: 1, preco_compra: 30 },
  ],
};

describe('toFormData', () => {
  it('monta os campos básicos da nota', () => {
    const form = toFormData(valores);

    expect(form.get('fornecedor_id')).toBe('3');
    expect(form.get('numero')).toBe('000456');
    expect(form.get('dt_emissao')).toBe('2026-11-04');
    expect(form.get('valor_total')).toBe('99.9');
    expect(form.get('forma_pagamento')).toBe('Boleto');
    expect(form.get('observacoes')).toBe('entrega ok');
  });

  it('anexa os itens no formato produtos[i][campo] esperado pelo PHP', () => {
    const form = toFormData(valores);

    expect(form.get('produtos[0][produto_id]')).toBe('1');
    expect(form.get('produtos[0][quantidade]')).toBe('2');
    expect(form.get('produtos[0][preco_compra]')).toBe('10.5');
    expect(form.get('produtos[1][produto_id]')).toBe('5');
    expect(form.get('produtos[1][quantidade]')).toBe('1');
    expect(form.get('produtos[1][preco_compra]')).toBe('30');
  });

  it('omite observações vazia', () => {
    const form = toFormData({ ...valores, observacoes: '' });
    expect(form.get('observacoes')).toBeUndefined();
  });

  it('anexa a foto com uri/name/type no formato do React Native', () => {
    const form = toFormData(valores, 'file:///data/user/0/app/cache/nota.png');
    const foto = form.get('imagem_nf') as unknown as {
      uri: string;
      name: string;
      type: string;
    };

    expect(foto.uri).toBe('file:///data/user/0/app/cache/nota.png');
    expect(foto.name).toBe('nota.png');
    expect(foto.type).toBe('image/png');
  });

  it('não anexa imagem quando não há foto (edição sem trocar a foto)', () => {
    const form = toFormData(valores, null);
    expect(form.get('imagem_nf')).toBeUndefined();
  });
});
