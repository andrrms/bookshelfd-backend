import { ConflictError } from '@/errors/custom-errors';
import { createUserSchema, updateUserSchema } from '@/schemas/user.schemas';
import userService from '@/services/user.service';
import { Request, Response } from 'express';
import { z } from 'zod';

class UserController {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const newUser = await userService.createUser(validatedData);
      return res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error });
      }

      if (error instanceof ConflictError) {
        return res.status(409).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async findAll(_req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const user = await userService.getUserById(userId);
      return res.json(user);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Usuário não encontrado.'
      ) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const validatedData = updateUserSchema.parse(req.body);
      const updatedUser = await userService.updateUser(userId, validatedData);
      return res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error });
      }
      if (
        error instanceof Error &&
        error.message === 'Usuário não encontrado.'
      ) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const deletedUser = await userService.deleteUser(userId);
      return res.json(deletedUser);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Usuário não encontrado.'
      ) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}

export default new UserController();
