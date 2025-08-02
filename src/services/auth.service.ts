// src/services/auth.service.ts

import prisma from '@/database';
import { NotFoundError, UnauthorizedError } from '@/errors/custom-errors';
import { loginSchema } from '@/schemas/auth.schemas'; // Precisamos de um schema separado para auth
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { JwtService } from './jwt.service';

type LoginInput = z.infer<typeof loginSchema>;
type RefreshTokenInput = string;

const jwtService = new JwtService();

class AuthService {
  async authenticateUser(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    const userPayload = { id: user.id };
    const accessToken = jwtService.generateAccessToken(userPayload);
    const refreshToken = jwtService.generateRefreshToken(userPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(token: RefreshTokenInput) {
    const decodedToken = jwtService.verifyRefreshToken(token);

    if (!decodedToken) {
      throw new UnauthorizedError('Refresh token inválido ou expirado.');
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token não encontrado ou expirado.');
    }

    await prisma.refreshToken.delete({ where: { token } });

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const userPayload = { id: user.id };
    const newAccessToken = jwtService.generateAccessToken(userPayload);
    const newRefreshToken = jwtService.generateRefreshToken(userPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

export default new AuthService();
