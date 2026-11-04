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

// Resposta padrão de autenticação: login e cadastro devolvem o mesmo formato
// ({ token, user }), então um único tipo serve para os dois.
export type AuthResponse = {
  token: string;
  user: AuthUser;
};

// Contrato de ENTRADA do formulário de cadastro.
// Os nomes dos campos batem com a validação do Laravel (name, email, password,
// password_confirmation) para que os erros 422 do servidor cheguem aos campos
// certos do formulário sem tradução.
export const RegisterSchema = z
  .object({
    name: z.string().min(1, 'Informe seu nome'),
    email: z.string().min(1, 'Informe o e-mail').email('Use um e-mail válido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirme a senha'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'As senhas não conferem',
    path: ['password_confirmation'],
  });
export type RegisterValues = z.infer<typeof RegisterSchema>;
