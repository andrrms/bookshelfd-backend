import { NotFoundError, UnauthorizedError } from '@/errors/custom-errors';

import { NextFunction, Request, Response } from 'express';
import z from 'zod';

export default function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: err.issues,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor.',
  });
}
