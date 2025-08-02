import { Request, Response } from 'express';
import { z } from 'zod';
import authService from '@/services/auth.service';
import { UnauthorizedError, NotFoundError } from '@/errors/custom-errors';
import { loginSchema, tokenSchema } from '@/schemas/auth.schemas';

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const tokens = await authService.authenticateUser(validatedData);
      return res.json(tokens);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error });
      }

      if (error instanceof UnauthorizedError) {
        return res.status(401).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const validatedData = tokenSchema.parse(req.body);
      const newTokens = await authService.refreshTokens(validatedData.token);
      return res.json(newTokens);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error });
      }

      if (error instanceof UnauthorizedError) {
        return res.status(401).json({ message: error.message });
      }

      if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}

export default new AuthController();
