import authController from '@/controllers/auth.controller';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);
authRouter.post('/logout-all', authController.logoutAll);
//GET verify-email
//POST forgot-password

export default authRouter;
