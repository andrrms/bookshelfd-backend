import { Router } from 'express';
import authRouter from './auth.routes';
import booksRouter from './books.routes';
import userRouter from './users.routes';
import { authenticate } from '@/middlewares/authMiddleware';
const router: Router = Router();

router.use('/auth', authRouter);

router.use(authenticate);
router.use('/users', userRouter);
router.use('/books', booksRouter);

export default router;
