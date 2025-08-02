import config from '@/config';
import prisma from '@/database';
import { DecodedJwtToken } from '@/types/auth';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader?.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, config.access_token_secret, async (err, jwtToken) => {
    if (err || !jwtToken) return res.sendStatus(403);

    const decoded = jwtToken as DecodedJwtToken;

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) return res.sendStatus(403);

    req.user = user;

    next();
  });
}
