import { describe, expect, it } from 'vitest';
import { LoginSchema, RegisterSchema } from './AuthSchema';

describe('LoginSchema', () => {
  it('aceita credenciais válidas', () => {
    const result = LoginSchema.safeParse({
      email: 'test@example.com',
      password: 'password',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita e-mail vazio ou inválido', () => {
    expect(LoginSchema.safeParse({ email: '', password: 'x' }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: 'nao-e-email', password: 'x' }).success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    expect(LoginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  const valido = {
    name: 'Aluno Novo',
    email: 'novo@fatec.pg',
    password: 'senha1234',
    password_confirmation: 'senha1234',
  };

  it('aceita um cadastro válido', () => {
    expect(RegisterSchema.safeParse(valido).success).toBe(true);
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = RegisterSchema.safeParse({
      ...valido,
      password: '1234',
      password_confirmation: '1234',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });

  it('rejeita confirmação de senha diferente', () => {
    const result = RegisterSchema.safeParse({
      ...valido,
      password_confirmation: 'senha9999',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['password_confirmation']);
      expect(result.error.issues[0].message).toBe('As senhas não conferem');
    }
  });

  it('rejeita nome vazio', () => {
    expect(RegisterSchema.safeParse({ ...valido, name: '' }).success).toBe(false);
  });

  it('rejeita e-mail inválido', () => {
    expect(RegisterSchema.safeParse({ ...valido, email: 'invalido' }).success).toBe(false);
  });
});
