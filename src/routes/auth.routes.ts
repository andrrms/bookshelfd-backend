import authController from '@/controllers/auth.controller';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post('/login', authController.login);
authRouter.post('/token', authController.refreshToken);

export default authRouter;
