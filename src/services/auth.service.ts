import config from '@/config';
import prisma, { User } from '@/database';
import { InvalidIdError, UnauthorizedError } from '@/errors/custom-errors';
import { LoginInput } from '@/schemas/auth.schemas';
import { AccessTokenPayload } from '@/schemas/user.schemas';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRATION: ms.StringValue;
  private readonly REFRESH_TOKEN_EXPIRATION: ms.StringValue;

  constructor() {
    this.ACCESS_TOKEN_SECRET = config.access_token_secret;

    this.ACCESS_TOKEN_EXPIRATION =
      config.jwt_access_expiration as ms.StringValue;

    this.REFRESH_TOKEN_EXPIRATION =
      config.jwt_refresh_expiration as ms.StringValue;
  }

  public signAccessToken(accessTokenPayload: AccessTokenPayload): string {
    return jwt.sign(accessTokenPayload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRATION,
    });
  }

  public decodeAccessToken(token: string) {
    const decoded = jwt.verify(
      token,
      this.ACCESS_TOKEN_SECRET,
    ) as AccessTokenPayload;

    if (!decoded) throw new InvalidIdError('Token inválido');

    return decoded;
  }

  async createSessionAndToken(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const sessionId = uuidv4();
    const refreshToken = uuidv4();

    const accessToken = this.signAccessToken({
      userId: user.id,
      role: user.role,
      sessionId: sessionId,
    });

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: accessToken,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + ms(this.REFRESH_TOKEN_EXPIRATION)),
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

    return await this.createSessionAndToken(user, ipAddress, userAgent);
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

    const newRefreshToken = uuidv4();

    const newAccessToken = this.signAccessToken({
      userId: session.user.id,
      sessionId: session.id,
      role: session.user.role,
    });

    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        lastRefreshedAt: new Date(),
      },
    });

    return { refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await prisma.session.update({
      where: { refreshToken, isRevoked: false },
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
