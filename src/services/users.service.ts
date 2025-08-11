import { PrismaErrors } from '@/constants/prisma-errors';
import prisma, { Prisma } from '@/database';
import { ConflictError, NotFoundError } from '@/errors/custom-errors';
import {
  createUserSchema,
  updateUserSchema,
  userResponseSchema,
} from '@/schemas/user.schemas';
import bcrypt from 'bcrypt';
import { z } from 'zod';

class UserService {
  async createUser(userData: z.infer<typeof createUserSchema>) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado.');
    }

    const { email, username, password } = userData;

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        salt,
      },
    });

    return userResponseSchema.parse(user);
  }

  async getAllUsers() {
    const users = await prisma.user.findMany();
    return users.map((user) => userResponseSchema.parse(user));
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    return userResponseSchema.parse(user);
  }

  async updateUser(id: string, userData: z.infer<typeof updateUserSchema>) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: userData,
      });

      return userResponseSchema.parse(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PrismaErrors.RecordNotFound) {
          throw new NotFoundError('Usuário não encontrado.');
        }
      }

      throw e;
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return userResponseSchema.parse(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PrismaErrors.RecordNotFound) {
          throw new NotFoundError('Usuário não encontrado.');
        }
      }

      throw e;
    }
  }
}

export default new UserService();
