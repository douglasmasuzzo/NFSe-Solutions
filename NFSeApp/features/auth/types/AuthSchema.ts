import { z } from 'zod';

// Usuário autenticado devolvido pela API (POST /api/login e GET /api/user).
export const AuthUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

// Contrato de ENTRADA do formulário de login.
export const LoginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('Use um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
});
export type LoginValues = z.infer<typeof LoginSchema>;
