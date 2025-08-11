import config from '@/config';
import prisma from '@/database';
import { UnauthorizedError } from '@/errors/custom-errors';
import { loginSchema } from '@/schemas/auth.schemas'; // Precisamos de um schema separado para auth
import {
  AccessTokenPayload,
  accessTokenPayloadSchema,
} from '@/schemas/user.schemas';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
type LoginInput = z.infer<typeof loginSchema>;
type RefreshTokenInput = string;

class AuthService {
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRATION: string;
  private readonly REFRESH_TOKEN_EXPIRATION: string;

  constructor() {
    this.ACCESS_TOKEN_SECRET = config.access_token_secret;
    this.REFRESH_TOKEN_SECRET = config.refresh_token_secret;
    this.ACCESS_TOKEN_EXPIRATION = config.jwt_access_expiration;
    this.REFRESH_TOKEN_EXPIRATION = config.jwt_refresh_expiration;
  }

  public signAccessToken(accessTokenPayload: AccessTokenPayload): string {
    return jwt.sign(accessTokenPayload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
  }

  public decodeAccessToken(token: string) {
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  }

  async login(data: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    const sessionId = uuidv4();
    const jti = uuidv4();

    const userPayload = accessTokenPayloadSchema.parse(user);

    const accessToken = this.signAccessToken(userPayload);
    const refreshToken = uuidv4();

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: accessToken,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    // Procura a sessão pelo refreshToken em vez de um modelo refreshToken separado
    const session = await prisma.session.findUnique({
      where: {
        refreshToken: token,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedError('Sessão não encontrada ou expirada.');
    }

    if (session.refreshToken !== token) {
      await this.revokeAllUserSessions(
        session.userId,
        'Reutilização de refresh token detectada',
      );

      throw new UnauthorizedError(
        'Alerta dAlerta de segurança: Possível roubo de token. Sessões revogadas.',
      );
    }

    const newAccessToken = this.signAccessToken({
      userId: session.user.id,
      sessionId: session.id,
      role: session.user.role,
    });

    const newRefreshToken = uuidv4();

    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        lastRefreshedAt: new Date(),
      },
    });
  }

  async logout(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedError(
        'Sessão não encontrada ou não pertence ao usuário.',
      );
    }

    if (session.isRevoked) {
      return { message: 'Sessão já encerrada.' };
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedReadon: 'Logout solicitado pelo usuário',
      },
    });

    return { message: 'Logout realizado com sucesso.' };
  }

  async revokeAllUserSessions(
    userId: string,
    reason: string = 'Usuário solicitou logout de todos os aparelhos',
  ) {
    await prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedReadon: reason },
    });
  }
}

export default new AuthService();
