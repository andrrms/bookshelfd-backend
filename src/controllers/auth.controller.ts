import { loginSchema, tokenSchema } from '@/schemas/auth.schemas';
import { createUserSchema } from '@/schemas/user.schemas';
import authService from '@/services/auth.service';
import usersService from '@/services/users.service';
import { Request, Response } from 'express';

class AuthController {
  async register(req: Request, res: Response) {
    const validatedData = createUserSchema.parse(req.body);
    const newUser = await usersService.createUser(validatedData);
    return res.status(201).json(newUser);
  }

  async login(req: Request, res: Response) {
    const validatedData = loginSchema.parse(req.body);
    const tokens = await authService.login(validatedData);
    return res.json(tokens);
  }

  async refreshToken(req: Request, res: Response) {
    const validatedData = tokenSchema.parse(req.body);
    const newTokens = await authService.refreshToken(
      validatedData.refreshToken,
    );
    return res.json(newTokens);
  }

  async logout(req: Request, res: Response) {
    const validatedData = tokenSchema.parse(req.body);
    await authService.logout(validatedData.refreshToken);
  }

  async logoutAll(req: Request, res: Response) {
    await authService.revokeAllUserSessions(req.user.id);
  }
}

export default new AuthController();
