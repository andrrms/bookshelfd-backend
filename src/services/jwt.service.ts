import jwt from 'jsonwebtoken';
import config from '../config';
import { UserTokenPayload } from '@/schemas/user.schemas';

export class JwtService {
  private readonly ACCESS_TOKEN_SECRET = config.access_token_secret;
  private readonly REFRESH_TOKEN_SECRET = config.refresh_token_secret;

  public generateAccessToken(userPayload: UserTokenPayload): string {
    return jwt.sign(userPayload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
  }

  public generateRefreshToken(userPayload: UserTokenPayload): string {
    return jwt.sign(userPayload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });
  }

  public verifyToken(token: string, secret: string): UserTokenPayload | null {
    try {
      return jwt.verify(token, secret) as UserTokenPayload;
    } catch (error) {
      return null;
    }
  }

  public verifyAccessToken(token: string): UserTokenPayload | null {
    return this.verifyToken(token, this.ACCESS_TOKEN_SECRET);
  }

  public verifyRefreshToken(token: string): UserTokenPayload | null {
    return this.verifyToken(token, this.REFRESH_TOKEN_SECRET);
  }
}
