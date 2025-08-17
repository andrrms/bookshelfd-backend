import { UserRole } from '@/database';
import { UnauthorizedError } from '@/errors/custom-errors';
import authService from '@/services/auth.service';
import userService from '@/services/users.service';
import { NextFunction, Request, Response } from 'express';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError();
  }

  try {
    const decoded = authService.decodeAccessToken(token);
    const user = await userService.getUserById(decoded.userId);

    req.user = user;

    next();
  } catch (err) {
    throw new UnauthorizedError();
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permissões insuficientes' });
    }

    next();
  };
};
