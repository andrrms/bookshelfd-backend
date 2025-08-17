import { ContentStatus } from '@/database';
import { z } from 'zod';

export const bookSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  title: z.string().min(1, 'O título não pode ser vazio.'),
  description: z.string().optional(),
  isbn: z.string().optional(),
  isbn13: z.string().optional(),
  coverUrl: z.string().url('A URL da capa deve ser válida.').optional(),
  publishDate: z.coerce.date().optional(),
  pageCount: z.number().int().positive().optional(),
  language: z.string().optional(),
  status: z.enum(ContentStatus).default('DRAFT'),
  author: z.string().min(1, 'O nome do autor não pode ser vazio.'),
  creatorId: z.uuid(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().optional(),
});

export const createBookSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  isbn13: z.string().nullable().optional(),
  coverUrl: z.url().nullable().optional(),
  publishDate: z.date().nullable().optional(),
  pageCount: z.number().int().nullable().optional(),
  language: z.string().nullable().optional(),
  status: z.enum(ContentStatus).default('DRAFT'),
  author: z.string(),
  creatorId: z.uuid(),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;

export const findUserByUsernameSchema = z.object({
  username: z.string({
    message: 'O username deve ser uma string válida',
  }),
});
