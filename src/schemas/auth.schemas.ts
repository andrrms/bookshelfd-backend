import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Formato de e-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const tokenSchema = z.object({
  token: z.string().min(1, 'O token é obrigatório.'),
});

export type TokenInput = z.infer<typeof tokenSchema>;
