import { loginSchema, tokenSchema } from '@/schemas/auth.schemas';
import authService from '@/services/auth.service';
import { Request, Response } from 'express';

class AuthController {
  async login(req: Request, res: Response) {
    const validatedData = loginSchema.parse(req.body);
    const tokens = await authService.authenticateUser(validatedData);
    return res.json(tokens);
  }

  async refreshToken(req: Request, res: Response) {
    const validatedData = tokenSchema.parse(req.body);
    const newTokens = await authService.refreshTokens(validatedData.token);
    return res.json(newTokens);
  }
}

export default new AuthController();
