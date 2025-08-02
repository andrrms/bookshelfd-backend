import { z } from 'zod';

export const userCoreSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .optional(),
  reputation: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const createUserSchema = userCoreSchema
  .omit({
    id: true,
    reputation: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .required({
    username: true,
    email: true,
    password: true,
  });

export const updateUserSchema = userCoreSchema
  .omit({
    id: true,
    createdAt: true,
    reputation: true,
    deletedAt: true,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export const userResponseSchema = userCoreSchema
  .omit({
    password: true,
    deletedAt: true,
  })
  .required({
    id: true,
    username: true,
    email: true,
    reputation: true,
    createdAt: true,
    updatedAt: true,
  });
