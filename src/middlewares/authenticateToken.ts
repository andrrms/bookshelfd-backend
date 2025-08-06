import config from '@/config';
import prisma, { User } from '@/database';
import { NotFoundError, UnauthorizedError } from '@/errors/custom-errors';
import { UserTokenPayload } from '@/schemas/user.schemas';
import userService from '@/services/user.service';

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import z from 'zod';

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

    const decoded = jwtToken as UserTokenPayload;
    const user = await userService.getUserByUuid(decoded.uuid);

    req.user = user;

    next();
  });
}
