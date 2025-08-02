import jwt from 'jsonwebtoken';
import config from '../config';

interface userPayload {
  id: number;
}

export class JwtService {
  private readonly ACCESS_TOKEN_SECRET = config.access_token_secret;
  private readonly REFRESH_TOKEN_SECRET = config.refresh_token_secret;

  public generateAccessToken(userPayload: userPayload): string {
    return jwt.sign(userPayload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
  }

  public generateRefreshToken(userPayload: userPayload): string {
    return jwt.sign(userPayload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });
  }

  public verifyToken(token: string, secret: string): userPayload | null {
    try {
      return jwt.verify(token, secret) as userPayload;
    } catch (error) {
      return null;
    }
  }

  public verifyAccessToken(token: string): userPayload | null {
    return this.verifyToken(token, this.ACCESS_TOKEN_SECRET);
  }

  public verifyRefreshToken(token: string): userPayload | null {
    return this.verifyToken(token, this.REFRESH_TOKEN_SECRET);
  }
}
