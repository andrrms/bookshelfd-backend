import { UserRole } from '@/database';
import { z } from 'zod';

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.url().nullable().optional(),
  passwordHash: z.string(),
  salt: z.string(),
  role: UserRole,
  reputation: z.number().int().default(0),
  emailVerified: z.boolean().default(false),
  verificationToken: z.string().nullable().optional(),
  resetPasswordToken: z.string().nullable().optional(),
  resetPasswordExpires: z.date().nullable().optional(),
  lastLogin: z.date().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createUserSchema = z
  .object({
    email: z.email(),
    username: z.string(),
    password: z
      .string({
        error: 'Required',
      })
      .min(8, { message: 'min 8' }),
    password_confirmation: z
      .string({
        error: 'Required',
      })
      .min(8, { message: 'min 8' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const updateUserSchema = z.object({
  email: z.email(),
  username: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.url().nullable().optional(),
});

export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.url().nullable().optional(),
  role: UserRole,
  reputation: z.number().int().default(0),
  emailVerified: z.boolean().default(false),
  lastLogin: z.date().nullable().optional(),
});

export const accessTokenPayloadSchema = z.object({
  userId: z.uuid(),
  sessionId: z.uuid(),
  role: UserRole,
});

export type UserSchema = z.infer<typeof userSchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
