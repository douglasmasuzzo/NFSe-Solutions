import { describe, expect, it } from 'vitest';
import { extractValidationErrors } from './apiErrors';

function axiosError(status: number, data: unknown) {
  return Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    response: { status, data },
  });
}

describe('extractValidationErrors', () => {
  it('converte o 422 do Laravel em mensagens por campo', () => {
    const error = axiosError(422, {
      message: 'The given data was invalid.',
      errors: {
        numero: ['Informe o número da nota'],
        valor_total: ['O valor deve ser maior ou igual a zero'],
        'produtos.0.quantidade': ['A quantidade deve ser no mínimo 1'],
      },
    });

    expect(extractValidationErrors(error)).toEqual({
      numero: 'Informe o número da nota',
      valor_total: 'O valor deve ser maior ou igual a zero',
      'produtos.0.quantidade': 'A quantidade deve ser no mínimo 1',
    });
  });

  it('pega a primeira mensagem quando o campo tem várias', () => {
    const error = axiosError(422, {
      errors: { email: ['E-mail inválido', 'Campo obrigatório'] },
    });

    expect(extractValidationErrors(error)).toEqual({ email: 'E-mail inválido' });
  });

  it('retorna vazio para erro sem validação (rede, 500, timeout)', () => {
    expect(extractValidationErrors(axiosError(500, { message: 'Erro' }))).toEqual({});
    expect(extractValidationErrors(new Error('Network Error'))).toEqual({});
    expect(extractValidationErrors(undefined)).toEqual({});
  });
});
