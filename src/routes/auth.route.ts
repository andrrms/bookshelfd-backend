import prisma from '@/database';
import { AuthService } from '@/services/auth.service';
import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(3, 'Senha deve ter pelo menos 6 caracteres'),
});

export const tokenSchema = z.object({
  token: z.string(),
});

const authRouter: Router = Router();
const authService = new AuthService();

authRouter.post('/login', async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ errors: z.treeifyError(parseResult.error) });
  }

  const { email, password } = parseResult.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos' });
  }

  const userPayload = { id: user.id };

  const refreshToken = authService.generateAccessToken(userPayload);
  const accessToken = authService.generateRefreshToken(userPayload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return res.json({ accessToken, refreshToken });
});

authRouter.post('/token', async (req: Request, res: Response) => {
  const parseResult = tokenSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const { token } = parseResult.data;

  const decodedToken = authService.verifyRefreshToken(token);

  if (!decodedToken) {
    return res
      .status(401)
      .json({ message: 'Refresh token inválido ou expirado' });
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return res
      .status(401)
      .json({ message: 'Refresh token não encontrado ou expirado' });
  }

  await prisma.refreshToken.delete({
    where: { token },
  });

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.id },
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const userPayload = { id: user.id };
  const newAccessToken = authService.generateAccessToken(userPayload);
  const newRefreshToken = authService.generateRefreshToken(userPayload);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export default authRouter;
