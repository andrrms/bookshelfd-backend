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

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    return userResponseSchema.parse(user);
  }

  async getAllUsers() {
    const users = await prisma.user.findMany();
    return users.map((user) => userResponseSchema.parse(user));
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    return userResponseSchema.parse(user);
  }

  async getUserByUuid(uuid: string) {
    const user = await prisma.user.findUnique({
      where: { uuid, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    return userResponseSchema.parse(user);
  }

  async updateUser(id: number, userData: z.infer<typeof updateUserSchema>) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

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

  async deleteUser(id: number) {
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
