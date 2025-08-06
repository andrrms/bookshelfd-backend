import { BookStatus } from '@/database';
import { z } from 'zod';

const bookStatusEnum = z.enum(BookStatus);

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(10).max(17).optional(),
  description: z.string().optional(),
  status: bookStatusEnum.optional(),
  contributorUuid: z.string(),
});

export const updateBookSchema = createBookSchema.partial();

export const bookResponseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(10).max(17).optional(),
  description: z.string().optional(),
  status: bookStatusEnum.optional(),
  contributorUuid: z.string(),
});

export type BookCreateInput = z.infer<typeof createBookSchema>;
export type BookUpdateInput = z.infer<typeof updateBookSchema>;

export const findUserByIdSchema = z.object({
  id: z.uuid({
    message: 'O ID deve ser um UUID válido.',
  }),
});
