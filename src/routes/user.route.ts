import prisma from '@/database';
import {
  createUserSchema,
  updateUserSchema,
  userResponseSchema,
} from '@/schemas/user.schema';
import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

const userRouter: Router = Router();

userRouter.post('/user', async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    });

    const response = userResponseSchema.parse(user);

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error });
    }

    return res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
});

userRouter.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const response = userResponseSchema.parse(user);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
});

userRouter.put('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const validatedData = updateUserSchema.parse(req.body);

    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    const response = userResponseSchema.parse(user);
    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error });
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2025'
    ) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
});

userRouter.delete('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    const response = userResponseSchema.parse(user);
    return res.json(response);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2025'
    ) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao deletar usuário.' });
  }
});

userRouter.get('/user', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    const response = users.map((user) => userResponseSchema.parse(user));
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar usuários.' });
  }
});

export default userRouter;
